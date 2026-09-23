# Global Matrix Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a performant, fixed blue binary-rain Canvas background behind the complete RSoftware site without changing content behavior, accessibility, layout, or existing animations.

**Architecture:** A focused `matrix-background.js` module owns deterministic configuration, procedural column state, Canvas rendering, input reactions, responsive rebuilding, reduced-motion behavior, and cleanup. A dedicated stylesheet defines the global layer contract; `main.js` starts the module after the preloader and disposes it with the existing page lifecycle.

**Tech Stack:** HTML5 Canvas 2D, CSS, JavaScript ES modules, Node built-in test runner, existing Vanilla JS initialization pattern.

**Spec:** `docs/superpowers/specs/2026-09-16-matrix-background-design.md`

## Global Constraints

- Use Canvas 2D; do not add DOM glyph elements, workers, GSAP dependencies, or third-party libraries.
- The primary color is `#1E90FF`; supporting colors are `#00BFFF`, `#38BDF8`, `#7DD3FC`, `#BAE6FD`, and `#E0F7FF`.
- The Canvas is fixed to the viewport, non-interactive, and must not create document overflow.
- Content, cards, header, footer, controls, forms, cursor, noise, skip link, and preloader must remain above the Canvas.
- Desktop DPR is capped at `2`; mobile/coarse-pointer DPR is capped at `1.5`.
- Scroll speed boost is capped at `1.22`; scroll brightness boost is capped at `1.12`.
- Pointer interaction is disabled for coarse pointers and reduced motion.
- Reduced motion renders a static frame and schedules no continuous animation loop.
- Initialization must return a disposer that cancels all owned frames and removes every owned listener.
- Preserve all pre-existing working-tree changes. Use explicit paths for staging. Do not commit modifications to already-dirty integration files without confirming that the commit contains only intended hunks.

---

## File Structure

- Create `js/matrix-background.js`: profiles, responsive settings, column generation, physics, rendering, controller lifecycle, and public initializer.
- Create `css/matrix-background.css`: viewport Canvas and global layer contract.
- Create `tests/matrix-background.test.mjs`: deterministic simulation, rendering, reduced-motion, resize, and cleanup tests.
- Modify `index.html`: stylesheet link and inert Canvas element.
- Modify `js/main.js`: initialize after preloader and dispose on `pagehide`.

---

### Task 1: Responsive profiles and procedural column generation

**Files:**
- Create: `js/matrix-background.js`
- Create: `tests/matrix-background.test.mjs`

**Interfaces:**
- Produces: `getMatrixSettings({ width, dpr, coarse, reduced }) -> MatrixSettings`
- Produces: `createMatrixColumns({ width, height, settings, random }) -> MatrixColumn[]`
- `MatrixSettings` contains `dpr`, `densityScale`, `glowScale`, and exactly three layer profiles.
- `MatrixColumn` contains `layer`, `x`, `y`, `speed`, `trailLength`, `opacity`, `glow`, `fontSize`, `respawnDelay`, and `glyphOffset`.

- [ ] **Step 1: Write failing tests for desktop, mobile, and depth ordering**

Create `tests/matrix-background.test.mjs` with a data-URL importer matching the repository's existing ESM test pattern:

```js
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
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
node --test tests\matrix-background.test.mjs
```

Expected: FAIL because `js/matrix-background.js` does not exist.

- [ ] **Step 3: Implement settings and deterministic column generation**

Create `js/matrix-background.js` with immutable base profiles and helpers:

```js
const BASE_LAYERS = Object.freeze([
  Object.freeze({ name: "back", fontSize: 12, spacing: 42, speed: [20, 34], trail: [8, 15], opacity: [.08, .16], glow: 2 }),
  Object.freeze({ name: "middle", fontSize: 16, spacing: 31, speed: [34, 58], trail: [7, 13], opacity: [.16, .3], glow: 5 }),
  Object.freeze({ name: "front", fontSize: 20, spacing: 92, speed: [54, 82], trail: [5, 10], opacity: [.24, .4], glow: 8 })
]);

const between = (random, [minimum, maximum]) => minimum + (maximum - minimum) * random();
const integerBetween = (random, range) => Math.round(between(random, range));

export function getMatrixSettings({ width, dpr, coarse, reduced }) {
  const mobile = width < 760 || coarse;
  const densityScale = reduced ? .52 : mobile ? .62 : 1;
  const glowScale = reduced ? .35 : mobile ? .58 : 1;
  return {
    dpr: Math.min(Math.max(dpr || 1, 1), mobile ? 1.5 : 2),
    densityScale,
    glowScale,
    mobile,
    reduced,
    layers: BASE_LAYERS.map((layer) => ({
      ...layer,
      spacing: layer.spacing / densityScale,
      glow: layer.glow * glowScale
    }))
  };
}

export function createMatrixColumns({ width, height, settings, random = Math.random }) {
  return settings.layers.flatMap((layer) => {
    const count = Math.max(1, Math.floor(width / layer.spacing));
    return Array.from({ length: count }, (_, index) => ({
      layer: layer.name,
      x: Math.min(width, (index + random() * .72) * layer.spacing),
      y: between(random, [-height * 1.35, height * .85]),
      speed: between(random, layer.speed),
      trailLength: integerBetween(random, layer.trail),
      opacity: between(random, layer.opacity),
      glow: layer.glow * between(random, [.72, 1.08]),
      fontSize: layer.fontSize * between(random, [.92, 1.08]),
      respawnDelay: between(random, [0, 2.2]),
      glyphOffset: Math.floor(random() * 97)
    }));
  });
}
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
node --test tests\matrix-background.test.mjs
```

Expected: 3 passing tests.

- [ ] **Step 5: Commit the isolated model**

```powershell
git add -- js/matrix-background.js tests/matrix-background.test.mjs
git commit -m "feat: add matrix simulation profiles"
```

---

### Task 2: Frame physics, trail rendering, and interaction math

**Files:**
- Modify: `js/matrix-background.js`
- Modify: `tests/matrix-background.test.mjs`

**Interfaces:**
- Consumes: `MatrixSettings` and `MatrixColumn` from Task 1.
- Produces: `getScrollBoost(deltaY) -> { speed, brightness }`
- Produces: `approach(current, target, factor) -> number`
- Produces: `getPointerInfluence(column, pointer, radius?) -> number`
- Produces: `advanceColumn(column, { height, deltaSeconds, speedMultiplier, pointerMultiplier, random }) -> MatrixColumn`
- Produces: `drawMatrixFrame(ctx, state) -> void`

- [ ] **Step 1: Add failing tests for bounded scroll response and column reset**

Append:

```js
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
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run `node --test tests\matrix-background.test.mjs`.

Expected: FAIL because the three new exports do not exist.

- [ ] **Step 3: Implement bounded motion helpers**

Add:

```js
export function getScrollBoost(deltaY) {
  const intensity = Math.min(Math.abs(deltaY) / 720, 1);
  return {
    speed: 1 + intensity * .22,
    brightness: 1 + intensity * .12
  };
}

export function approach(current, target, factor) {
  return current + (target - current) * factor;
}

export function getPointerInfluence(column, pointer, radius = 120) {
  if (!pointer.active) return 1;
  const distance = Math.hypot(column.x - pointer.x, column.y - pointer.y);
  return distance < radius ? 1 + (1 - distance / radius) * .2 : 1;
}

export function advanceColumn(column, {
  height, deltaSeconds, speedMultiplier, pointerMultiplier = 1, random = Math.random
}) {
  if (column.respawnDelay > 0) {
    return { ...column, respawnDelay: Math.max(0, column.respawnDelay - deltaSeconds) };
  }
  const next = {
    ...column,
    y: column.y + column.speed * deltaSeconds * speedMultiplier * pointerMultiplier
  };
  const tailHeight = column.trailLength * column.fontSize;
  if (next.y - tailHeight <= height + column.fontSize) return next;
  return {
    ...next,
    y: -tailHeight - random() * height * .5,
    respawnDelay: .15 + random() * 1.85,
    glyphOffset: Math.floor(random() * 97)
  };
}
```

- [ ] **Step 4: Add a failing renderer test using a recording Canvas context**

Append:

```js
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
  assert.equal(glyphs.length, 5);
  assert.ok(glyphs.every(([, glyph]) => glyph === "0" || glyph === "1"));
  assert.ok(calls.some(([name, color]) => name === "fillStyle" && color === "#E0F7FF"));
});
```

- [ ] **Step 5: Run the renderer test and verify RED**

Run `node --test tests\matrix-background.test.mjs`.

Expected: FAIL because `drawMatrixFrame` is not exported.

- [ ] **Step 6: Implement the Canvas renderer**

Add a palette and `drawMatrixFrame`. It must clear once, draw full trails, use a deterministic glyph from `(glyphOffset + trailIndex + frameIndex) % 2`, use the bright color for selected heads, and scale pointer influence within a 120px radius:

```js
const MATRIX_COLORS = Object.freeze(["#1E90FF", "#00BFFF", "#38BDF8", "#7DD3FC", "#BAE6FD"]);

export function drawMatrixFrame(ctx, state) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  state.columns.forEach((column, columnIndex) => {
    if (column.respawnDelay > 0) return;
    const pointerBoost = getPointerInfluence(column, state.pointer);
    ctx.font = `600 ${column.fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.shadowColor = "#1E90FF";
    ctx.shadowBlur = column.glow * pointerBoost;

    for (let trailIndex = 0; trailIndex < column.trailLength; trailIndex += 1) {
      const progress = trailIndex / Math.max(column.trailLength - 1, 1);
      const alpha = column.opacity * (1 - progress) * state.brightnessMultiplier * pointerBoost;
      const brightHead = trailIndex === 0 && columnIndex % 3 === 0;
      ctx.globalAlpha = Math.min(alpha * (brightHead ? 1.45 : 1), .82);
      ctx.fillStyle = brightHead ? "#E0F7FF" : MATRIX_COLORS[(columnIndex + trailIndex) % MATRIX_COLORS.length];
      ctx.fillText((column.glyphOffset + trailIndex + state.frameIndex) % 2 ? "1" : "0", column.x, column.y - trailIndex * column.fontSize);
    }
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
```

- [ ] **Step 7: Run tests and verify GREEN**

Run `node --test tests\matrix-background.test.mjs`.

Expected: all Task 1 and Task 2 tests pass.

- [ ] **Step 8: Commit physics and rendering**

```powershell
git add -- js/matrix-background.js tests/matrix-background.test.mjs
git commit -m "feat: render layered binary rain"
```

---

### Task 3: Lifecycle controller, resize, visibility, and reduced motion

**Files:**
- Modify: `js/matrix-background.js`
- Modify: `tests/matrix-background.test.mjs`

**Interfaces:**
- Consumes all Task 1 and Task 2 functions.
- Produces: `initMatrixBackground(options?) -> () => void`
- `options` supports injected `canvas`, `win`, `doc`, `random`, `requestFrame`, and `cancelFrame` for tests.

- [ ] **Step 1: Add a deterministic environment helper to the test file**

```js
function createEnvironment({ reduced = false, coarse = false } = {}) {
  const listeners = new Map();
  const scheduled = new Map();
  const mediaQueries = new Map();
  let nextFrameId = 1;
  const context = {
    clearRect() {}, fillText() {}, setTransform() {}, save() {}, restore() {}, scale() {},
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
    innerWidth: 1024, innerHeight: 768, devicePixelRatio: 2,
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
```

- [ ] **Step 2: Add failing lifecycle tests**

```js
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

test("missing canvas returns a safe no-op disposer", async () => {
  const { initMatrixBackground } = await importMatrixModule();
  const dispose = initMatrixBackground({ canvas: null });
  assert.doesNotThrow(dispose);
});
```

- [ ] **Step 3: Run lifecycle tests and verify RED**

Run `node --test tests\matrix-background.test.mjs`.

Expected: FAIL because `initMatrixBackground` does not exist.

- [ ] **Step 4: Implement the controller with owned resources**

Implement `initMatrixBackground` with these concrete rules:

```js
export function initMatrixBackground(options = {}) {
  const win = options.win ?? globalThis.window;
  const doc = options.doc ?? globalThis.document;
  const canvas = options.canvas === undefined
    ? doc?.querySelector?.("#matrix-background")
    : options.canvas;
  const random = options.random ?? Math.random;
  const requestFrame = options.requestFrame ?? win?.requestAnimationFrame?.bind(win);
  const cancelFrame = options.cancelFrame ?? win?.cancelAnimationFrame?.bind(win);
  const ctx = canvas?.getContext?.("2d");
  if (!canvas || !ctx || !win || !doc || !requestFrame || !cancelFrame) return () => {};

  const reducedQuery = win.matchMedia("(prefers-reduced-motion: reduce)");
  const coarseQuery = win.matchMedia("(pointer: coarse)");
  let settings;
  let columns = [];
  let frameId = 0;
  let resizeFrameId = 0;
  let disposed = false;
  let lastTime = 0;
  let lastScrollY = win.scrollY;
  let targetSpeed = 1;
  let currentSpeed = 1;
  let targetBrightness = 1;
  let currentBrightness = 1;
  let frameIndex = 0;
  let pointerListenerActive = false;
  const pointer = { active: false, x: 0, y: 0 };

  const rebuild = () => {
    settings = getMatrixSettings({
      width: win.innerWidth,
      dpr: win.devicePixelRatio,
      coarse: coarseQuery.matches,
      reduced: reducedQuery.matches
    });
    canvas.width = Math.round(win.innerWidth * settings.dpr);
    canvas.height = Math.round(win.innerHeight * settings.dpr);
    canvas.style.width = `${win.innerWidth}px`;
    canvas.style.height = `${win.innerHeight}px`;
    ctx.setTransform(settings.dpr, 0, 0, settings.dpr, 0, 0);
    columns = createMatrixColumns({ width: win.innerWidth, height: win.innerHeight, settings, random });
  };

  const render = () => drawMatrixFrame(ctx, {
    width: win.innerWidth,
    height: win.innerHeight,
    dpr: settings.dpr,
    columns,
    frameIndex,
    brightnessMultiplier: currentBrightness,
    pointer
  });

  const tick = (time) => {
    frameId = 0;
    if (disposed || doc.hidden || reducedQuery.matches) return;
    const deltaSeconds = Math.min(lastTime ? (time - lastTime) / 1000 : 0, .05);
    lastTime = time;
    currentSpeed = approach(currentSpeed, targetSpeed, .05);
    currentBrightness = approach(currentBrightness, targetBrightness, .05);
    targetSpeed = approach(targetSpeed, 1, .035);
    targetBrightness = approach(targetBrightness, 1, .045);
    columns = columns.map((column) => advanceColumn(column, {
      height: win.innerHeight,
      deltaSeconds,
      speedMultiplier: currentSpeed,
      pointerMultiplier: getPointerInfluence(column, pointer),
      random
    }));
    frameIndex += 1;
    render();
    frameId = requestFrame(tick);
  };

  const start = () => {
    if (disposed || reducedQuery.matches || frameId) return;
    lastTime = 0;
    frameId = requestFrame(tick);
  };

  const stop = () => {
    if (frameId) cancelFrame(frameId);
    frameId = 0;
  };

  const onPointerMove = (event) => {
    if (coarseQuery.matches || reducedQuery.matches) return;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };
  const syncPointerListener = () => {
    const shouldListen = !coarseQuery.matches && !reducedQuery.matches;
    if (shouldListen && !pointerListenerActive) {
      win.addEventListener("pointermove", onPointerMove, { passive: true });
      pointerListenerActive = true;
    } else if (!shouldListen && pointerListenerActive) {
      win.removeEventListener("pointermove", onPointerMove);
      pointerListenerActive = false;
      pointer.active = false;
    }
  };
  const onScroll = () => {
    if (reducedQuery.matches) return;
    const boost = getScrollBoost(win.scrollY - lastScrollY);
    lastScrollY = win.scrollY;
    targetSpeed = Math.max(targetSpeed, boost.speed);
    targetBrightness = Math.max(targetBrightness, boost.brightness);
  };
  const onResize = () => {
    if (resizeFrameId) cancelFrame(resizeFrameId);
    resizeFrameId = requestFrame(() => {
      resizeFrameId = 0;
      rebuild();
      render();
    });
  };
  const onVisibilityChange = () => doc.hidden ? stop() : start();
  const onPreferenceChange = () => {
    stop();
    syncPointerListener();
    rebuild();
    render();
    start();
  };

  rebuild();
  render();
  if (!reducedQuery.matches) start();
  win.addEventListener("resize", onResize, { passive: true });
  win.addEventListener("scroll", onScroll, { passive: true });
  doc.addEventListener("visibilitychange", onVisibilityChange);
  syncPointerListener();
  reducedQuery.addEventListener("change", onPreferenceChange);
  coarseQuery.addEventListener("change", onPreferenceChange);

  return () => {
    disposed = true;
    stop();
    if (resizeFrameId) cancelFrame(resizeFrameId);
    win.removeEventListener("resize", onResize);
    win.removeEventListener("scroll", onScroll);
    if (pointerListenerActive) win.removeEventListener("pointermove", onPointerMove);
    doc.removeEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.removeEventListener("change", onPreferenceChange);
    coarseQuery.removeEventListener("change", onPreferenceChange);
  };
}
```

During implementation, keep the frame scheduler invariant explicit: `frameId` must represent the one queued animation callback. When `tick` schedules the next callback, do not allow a second call to `start()` to queue another one.

- [ ] **Step 5: Verify dynamic preference behavior**

Run the focused test that mutates the fake reduced-motion query in both directions. Confirm it cancels and restores the single frame loop, removes and restores the pointer listener, and never duplicates either resource.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run `node --test tests\matrix-background.test.mjs`.

Expected: every Matrix test passes with no warnings.

- [ ] **Step 7: Verify the duplicate-loop regression test**

Run the two-consecutive-visible-events test and retain its `scheduled.size === 1` assertion as a permanent regression check. Do not add a production-only testing hook.

- [ ] **Step 8: Commit lifecycle behavior**

```powershell
git add -- js/matrix-background.js tests/matrix-background.test.mjs
git commit -m "feat: manage matrix background lifecycle"
```

---

### Task 4: Global layer integration and application lifecycle

**Files:**
- Create: `css/matrix-background.css`
- Modify: `index.html`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `initMatrixBackground()` from Task 3.
- Produces: one fixed `#matrix-background` Canvas and one application-owned disposer.

- [ ] **Step 1: Inspect the exact integration anchors before editing**

Read the stylesheet links, opening body content, `main.js` imports, preloader `.finally()` block, and existing `pagehide` handler. Record the surrounding lines in the execution notes so the edits remain minimal and preserve unrelated working-tree changes.

- [ ] **Step 2: Add the Canvas and stylesheet link**

In `index.html`, load the stylesheet immediately after `css/globals.css`:

```html
<link rel="stylesheet" href="css/matrix-background.css">
```

Insert immediately after the skip link:

```html
<canvas id="matrix-background" aria-hidden="true"></canvas>
```

- [ ] **Step 3: Define the layer contract**

Create `css/matrix-background.css`:

```css
#matrix-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  background: transparent;
}

body::before { z-index: 1; }

main,
.site-footer {
  position: relative;
  z-index: 2;
}
```

Do not change the existing header, cursor, noise, WhatsApp, skip-link, or preloader z-index values.

- [ ] **Step 4: Wire initialization after the preloader**

In `js/main.js`, import:

```js
import { initMatrixBackground } from "./matrix-background.js";
```

Inside the existing preloader `.finally()` block, initialize before the cursor and GSAP animations:

```js
const disposeMatrix = safelyInitialize(initMatrixBackground) ?? (() => {});
```

In the existing `pagehide` handler, call it before disposing GSAP:

```js
disposeMatrix();
```

Do not create a second `pagehide` listener.

- [ ] **Step 5: Run all automated checks**

Run:

```powershell
node --test tests\*.test.mjs
node --check js\matrix-background.js
node --check js\main.js
git diff --check
```

Expected: all tests pass, syntax commands return exit code 0, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Audit the integration diff before staging**

Run:

```powershell
git diff -- index.html js/main.js css/matrix-background.css
git status --short
```

Confirm that `index.html` and `js/main.js` already contained user changes before this task. Do not stage or commit those entire files unless the user explicitly authorizes including their existing changes. It is safe to commit the new stylesheet by explicit path; leave overlapping integration files unstaged when their unrelated hunks cannot be isolated safely.

- [ ] **Step 7: Commit only safe isolated files**

```powershell
git add -- css/matrix-background.css tests/matrix-background.test.mjs js/matrix-background.js
git commit -m "feat: add global matrix background"
```

Leave `index.html` and `js/main.js` uncommitted if they still contain pre-existing changes. Report that status explicitly in the handoff.

---

### Task 5: Runtime, responsive, accessibility, and performance verification

**Files:**
- Modify only if a failing verification produces a reproducible defect: `js/matrix-background.js`, `css/matrix-background.css`, or their tests.

**Interfaces:**
- Verifies the complete feature produced by Tasks 1–4.

- [ ] **Step 1: Start the existing static site locally**

Use an available local static server. If Python is unavailable, use the repository-compatible Node HTTP server already used during development. Do not install dependencies.

- [ ] **Step 2: Verify desktop behavior at 1440 × 900**

Confirm visually and through the browser console:

- Canvas bounding box matches the viewport.
- Canvas remains at the same viewport coordinates after scrolling from hero to footer.
- Binary trails are visible in open section backgrounds but remain secondary to text.
- Header, cursor, cards, buttons, links, form fields, floating WhatsApp control, and footer remain above the Canvas.
- Clicking FAQ items, navigation links, CTAs, and form fields works normally.
- No horizontal scrollbar appears.
- Console contains no errors.

- [ ] **Step 3: Verify mobile behavior at 390 × 844**

Confirm:

- Fewer columns render than desktop.
- Glow and density are visibly reduced.
- Pointer interaction is absent.
- Menu, scrolling, FAQ, cards, and form remain responsive and usable.
- Canvas backing dimensions reflect the capped mobile DPR.

- [ ] **Step 4: Verify resize and lifecycle behavior**

Resize repeatedly between desktop and mobile widths. Confirm the Canvas backing size updates, column density changes, no duplicate animation appears, and the console remains clean. Switch the tab away and back; confirm the animation resumes without jumping.

- [ ] **Step 5: Verify reduced motion**

Enable `prefers-reduced-motion: reduce`. Reload and confirm a static binary composition appears, scroll and pointer do not change it, and no continuous Canvas frame loop is scheduled.

- [ ] **Step 6: Run the final verification gate**

Run fresh:

```powershell
node --test tests\*.test.mjs
node --check js\matrix-background.js
node --check js\main.js
git diff --check
git status --short
```

Expected: all tests pass, syntax checks return 0, diff check returns 0, and status lists only intentional feature files plus the pre-existing user changes.

- [ ] **Step 7: Commit any test-driven verification fix separately**

Only when verification exposed a defect and a failing regression test was added first:

```powershell
git add -- js/matrix-background.js css/matrix-background.css tests/matrix-background.test.mjs
git commit -m "fix: harden matrix background integration"
```

Do not create an empty verification commit.
