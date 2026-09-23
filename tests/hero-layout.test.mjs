import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

async function importSkillsModule() {
  const source = await readFile(projectFile("js/skills.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("hero removes the eyebrow and video and places technologies after the CTAs", async () => {
  const html = await readFile(projectFile("index.html"), "utf8");
  const hero = html.match(/<section id="topo"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.ok(hero, "hero section should exist");
  assert.doesNotMatch(hero, /class="eyebrow"/);
  assert.doesNotMatch(hero, /<video\b/);
  assert.match(hero, /<div class="cta-row"[\s\S]*?<\/div>\s*<div class="hero__technologies"/);
});

test("preloader keeps the RSoftware wordmark without displaying the logo", async () => {
  const html = await readFile(projectFile("index.html"), "utf8");
  const css = await readFile(projectFile("css/preloader.css"), "utf8");
  const preloader = html.match(/<div class="preloader"[\s\S]*?<header class="site-header"/)?.[0] ?? "";

  assert.match(preloader, /class="preloader__brand"/);
  assert.doesNotMatch(preloader, /class="preloader__brand-mark"/);
  assert.doesNotMatch(css, /\.preloader__brand-mark/);
});

test("technology marquee renders only duplicated blue icons", async () => {
  const { renderTechnologyMarquee } = await importSkillsModule();
  const container = { innerHTML: "" };
  const technologies = [
    { name: "HTML", iconSlug: "html5" },
    { name: "React", iconSlug: "react" }
  ];

  renderTechnologyMarquee(container, technologies);

  assert.equal((container.innerHTML.match(/<img\b/g) ?? []).length, 4);
  assert.equal((container.innerHTML.match(/#4cc9ff/g) ?? []).length, 4);
  assert.doesNotMatch(container.innerHTML, />\s*(HTML|React)\s*</);
  assert.match(container.innerHTML, /aria-label="HTML"/);
  assert.match(container.innerHTML, /aria-label="React"/);
});

test("skill cards expose each technology accent color to the visual layer", async () => {
  const { renderSkills } = await importSkillsModule();
  const container = { innerHTML: "" };
  const technologies = [
    { name: "HTML", accent: "#e34f26", logo: "html.svg", copy: "Markup", use: "Sites" },
    { name: "React", accent: "#61dafb", logo: "react.svg", copy: "Components", use: "Apps" }
  ];

  renderSkills(container, technologies);

  assert.match(container.innerHTML, /style="--skill-accent:#e34f26;--i:0"/);
  assert.match(container.innerHTML, /style="--skill-accent:#61dafb;--i:1"/);
});

test("skill cards isolate animated content from the grid item", async () => {
  const { renderSkills } = await importSkillsModule();
  const container = { innerHTML: "" };
  const technologies = [
    { name: "HTML", accent: "#e34f26", logo: "html.svg", copy: "Markup", use: "Sites" },
    { name: "React", accent: "#61dafb", logo: "react.svg", copy: "Components", use: "Apps" }
  ];

  renderSkills(container, technologies);

  assert.equal((container.innerHTML.match(/data-skill-motion/g) ?? []).length, 2);
});
