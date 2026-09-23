import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const footerModuleUrl = new URL("../js/footer.js", import.meta.url);

async function importFooterModule() {
  const source = await readFile(footerModuleUrl, "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("footer wordmark renders one animatable element per letter", async () => {
  const { renderFooterWordmark } = await importFooterModule();
  const container = { innerHTML: "" };

  renderFooterWordmark(container, "RSoftware");

  assert.equal((container.innerHTML.match(/data-footer-letter/g) ?? []).length, 9);
  assert.match(container.innerHTML, />R<\/span>/);
  assert.match(container.innerHTML, />e<\/span>/);
  assert.doesNotMatch(container.innerHTML, />RSoftware</);
  assert.doesNotMatch(container.innerHTML, /<\/span>\s+<span/);
});

test("footer wordmark exits right-to-left and accents R last", async () => {
  const { getFooterWordmarkOrder } = await importFooterModule();

  assert.deepEqual(getFooterWordmarkOrder("RSoftware"), {
    entrance: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    exit: [8, 7, 6, 5, 4, 3, 2, 1, 0],
    accentIndex: 0
  });
});

test("static mode still renders the complete footer wordmark", async () => {
  const { initFooterWordmark } = await importFooterModule();
  const originalDocument = globalThis.document;
  const container = {
    dataset: { word: "RSoftware" },
    innerHTML: "RSoftware",
    querySelectorAll: () => []
  };
  globalThis.document = { querySelector: () => container };

  try {
    const dispose = initFooterWordmark(null, "static");
    assert.equal((container.innerHTML.match(/data-footer-letter/g) ?? []).length, 9);
    assert.doesNotThrow(dispose);
  } finally {
    globalThis.document = originalDocument;
  }
});

test("responsive footer wordmark fits the available width", async () => {
  const responsiveCss = await readFile(new URL("../css/responsive.css", import.meta.url), "utf8");

  assert.match(responsiveCss, /@media \(max-width: 560px\)[\s\S]*?\.footer-wordmark\s*\{[^}]*font-size:\s*clamp\(3rem, 13vw, 5rem\);/s);
  assert.doesNotMatch(responsiveCss, /\.footer-wordmark\s*\{[^}]*font-size:\s*clamp\([^)]*22vw/s);
});

test("footer animation starts immediately without waiting for scroll", async () => {
  const { initFooterWordmark } = await importFooterModule();
  const originalDocument = globalThis.document;
  const letters = Array.from({ length: 9 }, () => ({}));
  const events = [];
  let timelineConfig;
  const timeline = {
    to() { return this; },
    kill: () => events.push("kill-timeline")
  };
  const gsap = {
    set: (_targets, values) => events.push(["set", values]),
    timeline: (config) => {
      timelineConfig = config;
      return timeline;
    }
  };
  const container = {
    dataset: { word: "RSoftware" },
    innerHTML: "RSoftware",
    querySelectorAll: () => letters
  };
  globalThis.document = { querySelector: () => container };

  try {
    const dispose = initFooterWordmark(gsap, "compact");

    assert.equal(timelineConfig.repeat, -1);
    assert.equal(timelineConfig.repeatDelay, .5);
    assert.equal("paused" in timelineConfig, false);
    assert.equal("scrollTrigger" in timelineConfig, false);
    assert.equal(events.filter(([type]) => type === "set").length, 1);
    dispose();
    assert.ok(events.includes("kill-timeline"));
  } finally {
    globalThis.document = originalDocument;
  }
});
