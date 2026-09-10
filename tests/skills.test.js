import test from "node:test";
import assert from "node:assert/strict";
import { skills } from "../dist/js/skills.js";

test("includes Vercel as the eighth skill after Git", () => {
  assert.equal(skills.length, 8);
  assert.equal(skills[6].name, "Git");
  assert.equal(skills[7].name, "Vercel");
  assert.match(skills[7].copy, /deploy/i);
});
