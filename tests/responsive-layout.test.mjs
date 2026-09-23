import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

async function readProjectFile(path) {
  return readFile(projectFile(path), "utf8");
}

test("responsive menu renders its close control inside the open panel at the opener position", async () => {
  const [html, css, navigation] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("css/responsive.css"),
    readProjectFile("js/navigation.js")
  ]);
  const opener = html.match(/<button class="menu-toggle menu-toggle--open"[\s\S]*?<\/button>/)?.[0] ?? "";
  const menu = html.match(/<nav id="site-menu"[\s\S]*?<\/nav>/)?.[0] ?? "";

  assert.match(opener, /data-menu-toggle/);
  assert.match(opener, /data-lucide="menu"/);
  assert.doesNotMatch(opener, /data-lucide="x"/);
  assert.match(menu, /<button class="menu-toggle menu-toggle--close"[^>]*data-menu-close[\s\S]*?data-lucide="x"/);
  assert.match(css, /\.menu-toggle--close\s*\{[^}]*position:\s*fixed;[^}]*top:\s*calc\(\(var\(--header-h\) - 52px\) \/ 2\);[^}]*right:\s*var\(--header-pad\);/s);
  assert.match(css, /\.nav-open \.menu-toggle--open\s*\{[^}]*opacity:\s*0;[^}]*pointer-events:\s*none;/s);
  assert.match(css, /\.nav-open \.menu-toggle--close\s*\{[^}]*opacity:\s*1;[^}]*pointer-events:\s*auto;/s);
  assert.match(css, /\.brand,\s*\.menu-toggle--open\s*\{[^}]*z-index:\s*5;/s);
  assert.match(navigation, /const closeButton = document\.querySelector\("\[data-menu-close\]"\)/);
  assert.match(navigation, /closeButton\?\.addEventListener\("click", \(\) => setMenu\(false, \{ returnFocus: true \}\)\)/);
});

test("responsive menu presents every header link as a labeled navigation card and preserves its footer", async () => {
  const [html, responsiveCss] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("css/responsive.css")
  ]);
  const menu = html.match(/<nav id="site-menu"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const links = [...menu.matchAll(/<a class="site-nav__card" href="(#[^"]+)">[\s\S]*?<span class="site-nav__label">([^<]+)<\/span>[\s\S]*?<\/a>/g)];

  assert.match(menu, /<p class="site-nav__eyebrow">Navegue pelo site<\/p>/);
  assert.deepEqual(links.map(([, href, label]) => [href, label.trim()]), [
    ["#sobre", "Sobre"],
    ["#servicos", "Serviços"],
    ["#skills", "Skills"],
    ["#projetos", "Projetos"],
    ["#processo", "Processo"],
    ["#faq", "FAQ"],
    ["#contato", "Contato"]
  ]);
  assert.equal((menu.match(/class="site-nav__icon"/g) ?? []).length, 7);
  assert.equal((menu.match(/class="site-nav__arrow"/g) ?? []).length, 7);
  assert.match(menu, /<div class="site-nav__footer">\s*<p>© 2026 <span class="brand-word"><span class="brand-initial">R<\/span>Software<\/span>\. Todos os direitos reservados\.<\/p>\s*<\/div>/);
  assert.match(responsiveCss, /@media \(max-width: 980px\)[\s\S]*?\.site-nav__card\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*auto minmax\(0, 1fr\) auto;[^}]*border:\s*1px solid var\(--line\);/s);
});

test("desktop header CTA displays a looping reflection without affecting responsive navigation", async () => {
  const [headerCss, responsiveCss] = await Promise.all([
    readProjectFile("css/header.css"),
    readProjectFile("css/responsive.css")
  ]);

  assert.match(headerCss, /\.header-cta\s*\{[^}]*position:\s*relative;[^}]*overflow:\s*hidden;/s);
  assert.match(headerCss, /@media \(min-width: 981px\)[\s\S]*?\.header-cta::before\s*\{[^}]*linear-gradient\([^}]*animation:\s*header-cta-reflection 3\.4s ease-in-out infinite;/s);
  assert.match(headerCss, /@keyframes header-cta-reflection\s*\{[\s\S]*?translate3d\(-240%, 0, 0\)[\s\S]*?translate3d\(460%, 0, 0\)/s);
  assert.match(responsiveCss, /@media \(max-width: 980px\)[\s\S]*?\.header-cta\s*\{[^}]*display:\s*none;/s);
});

test("compact services keep the sticky card stack while reduced motion stays static", async () => {
  const css = await readProjectFile("css/responsive.css");

  assert.match(css, /\.motion-compact \.service-card\s*\{[^}]*position:\s*sticky;[^}]*top:\s*calc\(var\(--header-h\) \+ 12px\);/s);
  assert.match(css, /\.motion-static \.service-card\s*\{[^}]*position:\s*relative;[^}]*top:\s*auto;/s);
  assert.doesNotMatch(css, /\.motion-compact \.service-card,[\s\S]{0,180}position:\s*relative;/);
});

test("responsive skills show one horizontally snapping card at a time", async () => {
  const [css, skillsSource] = await Promise.all([
    readProjectFile("css/responsive.css"),
    readProjectFile("js/skills.js")
  ]);

  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.skills__stage,\s*\.project-track\s*\{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;[^}]*scroll-snap-type:\s*x mandatory;/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.skill-item\s*\{[^}]*flex:\s*0 0 100%;[^}]*scroll-snap-align:\s*start;/s);
  assert.match(skillsSource, /class="skills__stage"[^>]*role="region"[^>]*tabindex="0"/);
});

test("responsive projects use the same horizontal snap flow without the vertical GSAP stack", async () => {
  const [html, css, animations] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("css/responsive.css"),
    readProjectFile("js/animations.js")
  ]);

  assert.match(html, /class="project-track"[^>]*role="region"[^>]*tabindex="0"/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.project-track\s*\{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;[^}]*scroll-snap-type:\s*x mandatory;/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.project-panel\s*\{[^}]*position:\s*relative;[^}]*flex:\s*0 0 100%;[^}]*scroll-snap-align:\s*start;/s);
  assert.match(animations, /media\.add\("\(min-width: 981px\)", \(\) => \{[\s\S]*?initPanelStack\(gsap, "\[data-project-panel\]", profile\);[\s\S]*?\}\);/s);
  assert.doesNotMatch(animations, /if \(innerWidth > 980\) initPanelStack/);
});

test("skills and projects expose responsive arrow controls while keeping swipe navigation", async () => {
  const [html, css, skillsSource, main] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("css/responsive.css"),
    readProjectFile("js/skills.js"),
    readProjectFile("js/main.js")
  ]);

  assert.match(html, /data-carousel-controls[^>]*aria-controls="skills-carousel"/);
  assert.match(html, /id="projects-carousel"[^>]*data-project-track/);
  assert.match(html, /data-carousel-controls[^>]*aria-controls="projects-carousel"/);
  assert.equal((html.match(/data-carousel-previous/g) ?? []).length, 2);
  assert.equal((html.match(/data-carousel-next/g) ?? []).length, 2);
  assert.match(css, /\.carousel-controls\s*\{\s*display:\s*none;/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.carousel-controls\s*\{[^}]*display:\s*grid;/s);
  assert.match(skillsSource, /id="skills-carousel"[^>]*data-skills-stage/);
  assert.match(main, /initCarouselNavigation/);
});

test("responsive process hides progress and uses the services card stack animation", async () => {
  const [css, animations] = await Promise.all([
    readProjectFile("css/responsive.css"),
    readProjectFile("js/animations.js")
  ]);

  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.process__line\s*\{[^}]*display:\s*none;/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.motion-compact \.process-step,\s*\.motion-full \.process-step\s*\{[^}]*position:\s*sticky;/s);
  assert.match(css, /\.motion-(?:compact|full) \.process-step:nth-child\(2\)\s*\{[^}]*top:\s*calc\(var\(--header-h\) \+ 22px\);/s);
  assert.match(animations, /media\.add\("\(max-width: 980px\)", \(\) => \{\s*initPanelStack\(gsap, "\[data-process-step\]", profile\);\s*\}\);/s);
  assert.match(animations, /media\.add\("\(min-width: 981px\)", \(\) => \{[\s\S]*?initProcessSequence\(gsap, profile\);[\s\S]*?\}\);/s);
});

test("footer animation is initialized independently from responsive match-media blocks", async () => {
  const animations = await readProjectFile("js/animations.js");
  const footerInit = animations.indexOf("const disposeFooter = initFooterWordmark(gsap, profile);");
  const mediaInit = animations.indexOf("const media = gsap.matchMedia();");

  assert.ok(footerInit > 0);
  assert.ok(mediaInit > footerInit);
  assert.match(animations, /return \(\) => \{\s*disposeFooter\?\.\(\);\s*media\.revert\(\);\s*context\.revert\(\);/s);
});
