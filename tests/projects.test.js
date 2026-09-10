import test from "node:test";
import assert from "node:assert/strict";
import { projects, renderProjects } from "../dist/js/projects.js";

test("ships only explicit placeholder projects until real portfolio is configured", () => {
  assert.ok(projects.length >= 2);

  for (const project of projects) {
    assert.equal(project.placeholder, true);
    assert.ok(project.id);
    assert.ok(project.title.includes("Placeholder"));
    assert.ok(Array.isArray(project.technologies));
    assert.equal(typeof project.url === "string" || project.url === null, true);
  }
});

test("renders the RSoftware name with its palette-colored initial", () => {
  const container = { innerHTML: "" };

  renderProjects(container, [projects[0]]);

  assert.match(
    container.innerHTML,
    /<span class="brand-word"><span class="brand-initial">R<\/span>Software<\/span>/
  );
});
