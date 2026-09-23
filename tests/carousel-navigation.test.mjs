import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const moduleUrl = new URL("../js/carousel-navigation.js", import.meta.url);

async function importCarouselModule() {
  const source = await readFile(moduleUrl, "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("carousel arrows expose only valid directions at its boundaries", async () => {
  const { getCarouselState } = await importCarouselModule();

  assert.deepEqual(getCarouselState({ scrollLeft: 0, scrollWidth: 3200, clientWidth: 1000 }), {
    showPrevious: false,
    showNext: true
  });
  assert.deepEqual(getCarouselState({ scrollLeft: 1100, scrollWidth: 3200, clientWidth: 1000 }), {
    showPrevious: true,
    showNext: true
  });
  assert.deepEqual(getCarouselState({ scrollLeft: 2200, scrollWidth: 3200, clientWidth: 1000 }), {
    showPrevious: true,
    showNext: false
  });
  assert.deepEqual(getCarouselState({ scrollLeft: 0, scrollWidth: 1000, clientWidth: 1000 }), {
    showPrevious: false,
    showNext: false
  });
});

test("carousel index follows the nearest card", async () => {
  const { getClosestCarouselIndex } = await importCarouselModule();
  const track = { scrollLeft: 1040 };
  const items = [{ offsetLeft: 0 }, { offsetLeft: 1020 }, { offsetLeft: 2040 }];

  assert.equal(getClosestCarouselIndex(track, items), 1);
});
