import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const moduleUrl = new URL("../js/matrix-background.js", import.meta.url);

async function importMatrixModule() {
  const source = await readFile(moduleUrl, "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

function sequenceRandom(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

function createEnvironment({ reduced = false, coarse = false, width = 1024, height = 768 } = {}) {
  const listeners = new Map();
  const scheduled = new Map();
  const mediaQueries = new Map();
  let nextFrameId = 1;
  const context = {
    clearCount: 0,
    glyphCount: 0,
    glyphYs: [],
    frames: [],
    clearRect() { this.clearCount += 1; this.frames.push([]); },
    fillText(glyph, x, y) { this.glyphCount += 1; this.glyphYs.push(y); this.frames.at(-1).push([x, y]); },
    setTransform() {}, save() {}, restore() {}, scale() {},
    set font(value) {}, set fillStyle(value) {}, set shadowColor(value) {},
    set shadowBlur(value) {}, set textAlign(value) {}, set textBaseline(value) {}, set globalAlpha(value) {}
  };
  const canvas = { width: 0, height: 0, style: {}, getContext: () => context };
  const media = (name, matches) => ({
    matches,
    addEventListener: (event, fn) => listeners.set(`media:${name}`, fn),
    removeEventListener: () => listeners.delete(`media:${name}`)
  });
  mediaQueries.set("reduced", media("reduced", reduced));
  mediaQueries.set("coarse", media("coarse", coarse));
  const win = {
    innerWidth: width, innerHeight: height, devicePixelRatio: 2,
    scrollY: 0,
    matchMedia: (query) => mediaQueries.get(query.includes("reduced") ? "reduced" : "coarse"),
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name)
  };
  const doc = {
    hidden: false,
    addEventListener: (name, fn) => listeners.set(`document:${name}`, fn),
    removeEventListener: (name) => listeners.delete(`document:${name}`)
  };
  const requestFrame = (callback) => {
    const id = nextFrameId++;
    scheduled.set(id, callback);
    return id;
  };
  const cancelFrame = (id) => scheduled.delete(id);
  const flushNextFrame = (time = 16) => {
    const [id, callback] = scheduled.entries().next().value;
    scheduled.delete(id);
    callback(time);
  };
  return {
    canvas, context, win, doc, listeners, scheduled, mediaQueries,
    requestFrame, cancelFrame, flushNextFrame
  };
}

test("matrix settings reduce density, glow, and DPR on mobile", async () => {
  const { getMatrixSettings } = await importMatrixModule();
  const desktop = getMatrixSettings({ width: 1440, dpr: 3, coarse: false, reduced: false });
  const mobile = getMatrixSettings({ width: 390, dpr: 3, coarse: true, reduced: false });

  assert.equal(desktop.dpr, 2);
  assert.equal(mobile.dpr, 1.5);
  assert.ok(mobile.densityScale < desktop.densityScale);
  assert.ok(mobile.glowScale < desktop.glowScale);
  assert.equal(desktop.layers.length, 3);
});

test("matrix depth profiles progress from subtle background to sparse foreground", async () => {
  const { getMatrixSettings } = await importMatrixModule();
  const { layers } = getMatrixSettings({ width: 1440, dpr: 1, coarse: false, reduced: false });
  const [back, middle, front] = layers;

  assert.ok(back.fontSize < middle.fontSize);
  assert.ok(middle.fontSize < front.fontSize);
  assert.ok(back.speed[1] < middle.speed[1]);
  assert.ok(middle.speed[1] < front.speed[1]);
  assert.ok(back.opacity[1] < middle.opacity[1]);
  assert.ok(middle.opacity[1] < front.opacity[1]);
  assert.ok(front.spacing > middle.spacing);
});

test("column generation creates varied bounded state", async () => {
  const { getMatrixSettings, createMatrixColumns } = await importMatrixModule();
  const settings = getMatrixSettings({ width: 900, dpr: 1, coarse: false, reduced: false });
  const random = sequenceRandom([0.05, 0.25, 0.45, 0.65, 0.85]);
  const columns = createMatrixColumns({ width: 900, height: 700, settings, random });

  assert.ok(columns.length > 12);
  assert.equal(new Set(columns.map((column) => column.layer)).size, 3);
  assert.ok(new Set(columns.map((column) => column.speed)).size > 3);
  assert.ok(columns.every((column) => column.x >= 0 && column.x <= 900));
  assert.ok(columns.every((column) => column.y <= 700));
  assert.ok(columns.every((column) => column.trailLength >= 4));
});

test("scroll boost is bounded and interpolation returns smoothly", async () => {
  const { getScrollBoost, approach } = await importMatrixModule();

  assert.deepEqual(getScrollBoost(0), { speed: 1, brightness: 1 });
  assert.deepEqual(getScrollBoost(5000), { speed: 1.22, brightness: 1.12 });
  assert.equal(approach(1, 1.22, .1), 1.022);
  assert.ok(approach(1.2, 1, .05) < 1.2);
});

test("pointer influence is local and bounded", async () => {
  const { getPointerInfluence } = await importMatrixModule();
  const column = { x: 100, y: 100 };

  assert.equal(getPointerInfluence(column, { active: false, x: 100, y: 100 }), 1);
  assert.equal(getPointerInfluence(column, { active: true, x: 100, y: 100 }), 1.2);
  assert.equal(getPointerInfluence(column, { active: true, x: 300, y: 300 }), 1);
});

test("columns advance by elapsed time, honor delay, and respawn above the viewport", async () => {
  const { advanceColumn } = await importMatrixModule();
  const source = {
    layer: "middle", x: 100, y: 120, speed: 50, trailLength: 8,
    opacity: .2, glow: 4, fontSize: 16, respawnDelay: 0, glyphOffset: 4
  };
  const moved = advanceColumn(source, {
    height: 600, deltaSeconds: .5, speedMultiplier: 1.2, pointerMultiplier: 1, random: () => .5
  });
  assert.equal(moved.y, 150);

  const delayed = advanceColumn({ ...source, y: -100, respawnDelay: .5 }, {
    height: 600, deltaSeconds: .1, speedMultiplier: 1, pointerMultiplier: 1, random: () => .5
  });
  assert.equal(delayed.y, -100);
  assert.equal(delayed.respawnDelay, .4);

  const reset = advanceColumn({ ...source, y: 900 }, {
    height: 600, deltaSeconds: .016, speedMultiplier: 1, pointerMultiplier: 1, random: () => .5
  });
  assert.ok(reset.y < 0);
  assert.ok(reset.respawnDelay > 0);
});

test("renderer draws a bright head followed by a fading binary trail", async () => {
  const { drawMatrixFrame } = await importMatrixModule();
  const calls = [];
  const ctx = {
    clearRect: (...args) => calls.push(["clearRect", ...args]),
    fillText: (...args) => calls.push(["fillText", ...args]),
    setTransform() {}, save() {}, restore() {},
    set font(value) { calls.push(["font", value]); },
    set fillStyle(value) { calls.push(["fillStyle", value]); },
    set shadowColor(value) { calls.push(["shadowColor", value]); },
    set shadowBlur(value) { calls.push(["shadowBlur", value]); },
    set textAlign(value) {}, set textBaseline(value) {}, set globalAlpha(value) { calls.push(["alpha", value]); }
  };

  drawMatrixFrame(ctx, {
    width: 400,
    height: 300,
    dpr: 1,
    brightnessMultiplier: 1,
    pointer: { active: false, x: 0, y: 0 },
    columns: [{
      layer: "middle", x: 80, y: 120, speed: 40, trailLength: 5,
      opacity: .25, glow: 5, fontSize: 16, respawnDelay: 0, glyphOffset: 1
    }]
  });

  const glyphs = calls.filter(([name]) => name === "fillText");
  const trailAlphas = calls.filter(([name]) => name === "alpha").slice(0, 5).map(([, alpha]) => alpha);
  assert.equal(glyphs.length, 5);
  assert.ok(glyphs.every(([, glyph]) => glyph === "0" || glyph === "1"));
  assert.ok(trailAlphas.every((alpha) => alpha <= .82));
  assert.ok(trailAlphas.every((alpha, index) => index === 0 || alpha < trailAlphas[index - 1]));
  assert.ok(calls.some(([name, color]) => name === "fillStyle" && color === "#E0F7FF"));
});

test("animated mode owns one loop and cleanup removes every listener", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  assert.equal(env.scheduled.size, 1);
  assert.deepEqual([...env.listeners.keys()].sort(), [
    "document:visibilitychange", "media:coarse", "media:reduced",
    "pointermove", "resize", "scroll"
  ]);

  dispose();
  assert.equal(env.scheduled.size, 0);
  assert.equal(env.listeners.size, 0);
});

test("reduced motion draws once without creating a continuous loop", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment({ reduced: true });
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  assert.equal(env.scheduled.size, 0);
  assert.ok(env.canvas.width > 0);
  assert.ok(env.canvas.height > 0);
  assert.ok(env.context.glyphCount > 0);
  assert.ok(env.context.glyphYs.some((y) => y >= 0 && y <= env.win.innerHeight));
  assert.equal(env.listeners.has("pointermove"), false);
  dispose();
});

test("two visible-state events never create duplicate frame loops", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.listeners.get("document:visibilitychange")();
  env.listeners.get("document:visibilitychange")();
  assert.equal(env.scheduled.size, 1);
  dispose();
});

test("preference changes synchronize the loop and pointer listener", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.mediaQueries.get("reduced").matches = true;
  env.listeners.get("media:reduced")();
  assert.equal(env.scheduled.size, 0);
  assert.equal(env.listeners.has("pointermove"), false);

  env.mediaQueries.get("reduced").matches = false;
  env.listeners.get("media:reduced")();
  assert.equal(env.scheduled.size, 1);
  assert.equal(env.listeners.has("pointermove"), true);
  dispose();
});

test("reduced-motion scrolling refreshes the baseline before animation resumes", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment({ reduced: true });
  const dispose = initMatrixBackground({ ...env, random: () => 0 });

  env.win.scrollY = 500;
  env.listeners.get("scroll")();
  env.mediaQueries.get("reduced").matches = false;
  env.listeners.get("media:reduced")();
  env.context.frames.length = 0;

  env.win.scrollY = 501;
  env.listeners.get("scroll")();
  env.flushNextFrame(16);
  env.flushNextFrame(66);

  const firstHeadY = env.context.frames[0][0][1];
  const secondHeadY = env.context.frames[1][0][1];
  assert.ok(secondHeadY - firstHeadY < 1.01);
  dispose();
});

test("mobile viewport disables pointer interaction and resize keeps it synchronized", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const mobile = createEnvironment({ width: 390 });
  const disposeMobile = initMatrixBackground({ ...mobile, random: () => .5 });
  assert.equal(mobile.listeners.has("pointermove"), false);
  disposeMobile();

  const responsive = createEnvironment();
  const disposeResponsive = initMatrixBackground({ ...responsive, random: () => .5 });
  assert.equal(responsive.listeners.has("pointermove"), true);
  responsive.win.innerWidth = 390;
  responsive.listeners.get("resize")();
  responsive.flushNextFrame();
  assert.equal(responsive.listeners.has("pointermove"), false);
  disposeResponsive();
});

test("reduced-motion resize work is coalesced and rebuilds the backing store", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment({ reduced: true });
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.win.innerWidth = 390;
  env.win.innerHeight = 844;
  env.listeners.get("resize")();
  env.listeners.get("resize")();
  assert.equal(env.scheduled.size, 1);
  env.flushNextFrame();
  assert.equal(env.canvas.width, 585);
  assert.equal(env.canvas.height, 1266);
  assert.equal(env.scheduled.size, 0);
  dispose();
});

test("animated resize shares the pending animation callback", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.win.innerWidth = 390;
  const rendersBeforeResize = env.context.clearCount;
  env.listeners.get("resize")();
  assert.equal(env.scheduled.size, 1);
  env.flushNextFrame();
  assert.equal(env.canvas.width, 585);
  assert.equal(env.context.clearCount, rendersBeforeResize + 1);
  assert.equal(env.scheduled.size, 1);
  dispose();
});

test("hiding after resize cancels queued work until visibility returns", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.win.innerWidth = 390;
  env.listeners.get("resize")();
  env.doc.hidden = true;
  env.listeners.get("document:visibilitychange")();
  assert.equal(env.scheduled.size, 0);

  env.doc.hidden = false;
  env.listeners.get("document:visibilitychange")();
  assert.equal(env.scheduled.size, 1);
  env.flushNextFrame();
  assert.equal(env.canvas.width, 585);
  dispose();
});

test("preference changes while hidden schedule no frame work", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const env = createEnvironment();
  const dispose = initMatrixBackground({ ...env, random: () => .5 });

  env.doc.hidden = true;
  env.listeners.get("document:visibilitychange")();
  env.mediaQueries.get("coarse").matches = true;
  env.listeners.get("media:coarse")();
  assert.equal(env.scheduled.size, 0);
  dispose();
});

test("missing canvas returns a safe no-op disposer", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const dispose = initMatrixBackground({ canvas: null });
  assert.doesNotThrow(dispose);
});

test("site loads, starts, layers, and disposes the matrix background", async () => {
  const [html, main, styles] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../css/matrix-background.css", import.meta.url), "utf8")
  ]);

  const globalsLink = '<link rel="stylesheet" href="css/globals.css">';
  const matrixLink = '<link rel="stylesheet" href="css/matrix-background.css">';
  const skipLink = '<a class="skip-link" href="#conteudo">';
  const canvas = '<canvas id="matrix-background" aria-hidden="true"></canvas>';

  assert.ok(html.indexOf(matrixLink) > html.indexOf(globalsLink));
  assert.ok(html.indexOf(canvas) > html.indexOf(skipLink));
  assert.match(main, /import \{ initMatrixBackground \} from "\.\/matrix-background\.js";/);
  assert.ok(main.indexOf("safelyInitialize(initMatrixBackground)") < main.indexOf("safelyInitialize(initCursor)"));
  assert.match(main, /pagehide", \(event\) => \{\s*if \(event\.persisted\) return;[\s\S]*disposeMatrix\(\);[\s\S]*disposeAnimations\(\);/);
  assert.doesNotMatch(main, /pagehide[\s\S]*\{ once: true \}/);
  assert.match(styles, /#matrix-background\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*0;[^}]*pointer-events:\s*none;/s);
  assert.match(styles, /body::before\s*\{\s*z-index:\s*1;\s*\}/);
  assert.match(styles, /main,\s*\.site-footer\s*\{[^}]*z-index:\s*2;/s);
});
