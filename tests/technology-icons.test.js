import test from "node:test";
import assert from "node:assert/strict";
import { getTechnologyIcon } from "../dist/js/technology-icons.js";

test("maps supported technologies to accessible icon assets", () => {
  assert.match(getTechnologyIcon("React").src, /react/);
  assert.equal(getTechnologyIcon("React").name, "React");
  assert.equal(getTechnologyIcon("Unknown").name, "Unknown");
});

test("returns a neutral accessible mark for an unknown technology", () => {
  assert.match(getTechnologyIcon("Unknown").src, /^data:image\/svg\+xml/);
});
