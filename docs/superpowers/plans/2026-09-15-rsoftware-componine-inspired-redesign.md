# RSoftware Componine-Inspired Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the RSoftware site's layout and animations as a high-fidelity adaptation of Componine's editorial motion language while preserving every current RSoftware section, text, brand color, asset, and functional behavior.

**Architecture:** Keep the static HTML, modular CSS, and vanilla JavaScript architecture. Recompose the DOM with explicit animation hooks, centralize GSAP orchestration in focused initializers, retain existing data/configuration modules, and guarantee a static fallback whenever motion is reduced or GSAP is unavailable.

**Tech Stack:** HTML5, modular CSS, vanilla ES modules, GSAP 3.12.5, ScrollTrigger 3.12.5, Lucide CDN, Node.js syntax checks, PowerShell structural checks, Python static server, OpenAI Sites.

**Spec:** `docs/superpowers/specs/2026-09-15-rsoftware-componine-inspired-redesign-design.md`

## Global Constraints

- Preserve every current RSoftware section and every current Portuguese text string.
- Preserve section order: Hero, Sobre, Serviços, Skills, Projetos, Processo, FAQ, Contato, Footer.
- Preserve the RSoftware logo, local hero video, service/process images, project data, skill data, WhatsApp destination, and contact-form behavior.
- Keep `#080a0c`, graphite surfaces, white, and `#4cc9ff`; do not introduce Componine's cream or brown palette.
- Do not copy Componine branding, copy, proprietary assets, or source code.
- Keep static HTML, modular CSS, vanilla JavaScript, GSAP, and ScrollTrigger.
- Do not add a framework, package manager, build step, test directory, or `package.json`.
- Keep `.openai/hosting.json`, `robots.txt`, and `sitemap.xml`.
- All content must remain visible without GSAP and under `prefers-reduced-motion: reduce`.
- Mobile must avoid scroll traps and use normal-flow fallbacks on short viewports.
- Publish the validated result to the existing Sites project without changing its URL or audience.

## File Map

- `index.html`: semantic editorial wrappers, section indices, animation hooks, unchanged content.
- `css/variables.css`: brand-preserving display, spacing, depth, and motion tokens.
- `css/reset.css`: stable baseline and reduced-motion defaults.
- `css/globals.css`: typography, section shells, buttons, global grain, shared editorial utilities.
- `css/header.css`: fixed editorial navigation and scrolled state.
- `css/hero.css`: monumental first viewport and expanding video frame.
- `css/about.css`: manifesto composition.
- `css/services.css`: sticky numbered service stack.
- `css/skills.css`: marquee and layered skill stage.
- `css/projects.css`: immersive project stack.
- `css/process.css`: pinned process stage and static fallback.
- `css/faq.css`: large editorial accordion rows.
- `css/contact.css`: monumental contact/form composition.
- `css/footer.css`: oversized closing wordmark.
- `css/preloader.css`: percentage, mask, wordmark, and curtain transition.
- `css/cursor.css`: compact custom cursor states.
- `css/responsive.css`: tablet, phone, short-viewport, pointer, and reduced-motion behavior.
- `js/preloader.js`: bounded progress calculation, completion, and teardown.
- `js/animations.js`: motion profile and isolated GSAP/ScrollTrigger initializers.
- `js/process.js`: deterministic process progress setter and no-GSAP fallback.
- `js/cursor.js`: pointer detection, cursor interpolation, and magnetic offsets.
- `js/faq.js`: accessible accordion state with bounded Web Animations enhancement.
- `js/skills.js`: existing data plus editorial marquee/stage markup.
- `js/projects.js`: existing data plus animation hooks and editorial panel markup.
- `js/main.js`: initialization order and failure isolation.

---

### Task 1: Record the Approved Root Reorganization

**Files:**
- Stage existing approved changes: `.openai/hosting.json`, `README.md`, `assets/**`, `css/**`, `index.html`, `js/**`, `robots.txt`, `sitemap.xml`
- Stage existing approved removals: `dist/**`, `tests/**`, `package.json`

**Interfaces:**
- Consumes: the user-approved move from `dist/` to the project root and cleanup already present in the working tree.
- Produces: a clean baseline commit so redesign commits contain only redesign work.

- [ ] **Step 1: Verify the approved root structure**

```powershell
$required = @('.openai/hosting.json','index.html','assets','css','js','robots.txt','sitemap.xml')
$forbidden = @('dist','tests','package.json')
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
$present = $forbidden | Where-Object { Test-Path -LiteralPath $_ }
if ($missing) { throw "Missing: $($missing -join ', ')" }
if ($present) { throw "Unexpected: $($present -join ', ')" }
```

Expected: exits successfully.

- [ ] **Step 2: Verify the static root responds**

Run the server in a retained session:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

In a second shell:

```powershell
$response = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4173/
if ($response.StatusCode -ne 200) { throw "HTTP $($response.StatusCode)" }
```

Expected: HTTP 200. Stop the retained server after the check.

- [ ] **Step 3: Commit only the approved reorganization**

```powershell
git add -A -- .openai README.md assets css index.html js robots.txt sitemap.xml dist tests package.json
git commit -m "chore: simplify static site structure"
```

Expected: the previously approved move/removal is recorded without changing the redesign spec or plan commits.

---

### Task 2: Add the Editorial Markup Contract

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: existing section copy, media URLs, IDs, form fields, navigation anchors, and accessibility attributes.
- Produces: `[data-hero-title]`, `[data-hero-copy]`, `[data-hero-media]`, `[data-section-index]`, `[data-reveal-line]`, `[data-services-stack]`, `[data-skills-experience]`, `[data-process-stage]`, and `[data-contact-layout]` hooks.

- [ ] **Step 1: Run the failing structural contract**

```powershell
$html = Get-Content -Raw index.html
$required = @(
  'data-hero-title',
  'data-hero-copy',
  'data-hero-media',
  'data-section-index="01"',
  'data-services-stack',
  'data-skills-experience',
  'data-process-stage',
  'data-contact-layout'
)
$missing = $required | Where-Object { -not $html.Contains($_) }
if ($missing) { throw "Missing redesign hooks: $($missing -join ', ')" }
```

Expected: FAIL because the editorial hooks do not exist yet.

- [ ] **Step 2: Restructure the preloader and hero without changing copy**

Use this shape while retaining the exact existing Portuguese strings:

```html
<div class="preloader" data-preloader aria-label="Carregando site">
  <div class="preloader__topline"><span>RSoftware</span><span data-progress-label>0%</span></div>
  <div class="preloader__brand" aria-hidden="true">
    <span class="brand-initial">R</span>Software
  </div>
  <span class="preloader__bar"><span data-progress-bar></span></span>
  <div class="preloader__curtain" aria-hidden="true"></div>
</div>

<section id="topo" class="hero section-shell" aria-labelledby="hero-title">
  <div class="hero__copy" data-hero-copy>
    <p class="eyebrow" data-reveal-line>Desenvolvimento web sob medida</p>
    <h1 id="hero-title" data-hero-title>
      <span data-title-line>Software pensado</span>
      <span data-title-line>para fazer seu negócio</span>
      <span data-title-line>avançar.</span>
    </h1>
    <!-- retain the current paragraph and CTA row verbatim -->
  </div>
  <div class="hero__media" data-hero-media aria-hidden="true">
    <!-- retain the current video and source verbatim -->
  </div>
</section>
```

- [ ] **Step 3: Add editorial wrappers and section indices**

Add a visible index to each current section without adding new marketing copy:

```html
<div class="section-meta" aria-hidden="true">
  <span data-section-index="01">01</span>
  <span>Sobre</span>
</div>
```

Use `01` Sobre, `02` Serviços, `03` Skills, `04` Projetos, `05` Processo, `06` FAQ, and `07` Contato. Add `data-services-stack` to the service container, replace the skill render target class with `skills__experience` plus `data-skills-experience`, wrap the process heading/progress/steps in `data-process-stage`, and add `data-contact-layout` to the contact section.

- [ ] **Step 4: Prove that text and section order were preserved**

```powershell
$html = Get-Content -Raw index.html
$ordered = @('id="topo"','id="sobre"','id="servicos"','id="skills"','id="projetos"','id="processo"','id="faq"','id="contato"')
$cursor = -1
foreach ($token in $ordered) {
  $next = $html.IndexOf($token, $cursor + 1)
  if ($next -lt 0 -or $next -le $cursor) { throw "Section order failed at $token" }
  $cursor = $next
}
$requiredCopy = @(
  'Software pensado para fazer seu negócio avançar.',
  'Não desenvolvemos apenas interfaces. Desenvolvemos soluções.',
  'Soluções digitais com escopo claro e execução precisa.',
  'Tecnologia certa para cada desafio.',
  'Projetos construídos para resolver problemas reais.',
  'Da ideia ao produto, sem atalhos.',
  'Perguntas frequentes.',
  'Tem uma ideia? Vamos transformá-la em produto.'
)
$missingCopy = $requiredCopy | Where-Object { -not $html.Contains($_) }
if ($missingCopy) { throw "Copy changed or missing: $($missingCopy -join ' | ')" }
```

Expected: PASS.

- [ ] **Step 5: Commit the markup contract**

```powershell
git add index.html
git commit -m "feat: add editorial page structure"
```

---

### Task 3: Build the Visual Foundation and First Meaningful Preview

**Files:**
- Modify: `css/variables.css`
- Modify: `css/reset.css`
- Modify: `css/globals.css`
- Modify: `css/header.css`
- Modify: `css/hero.css`

**Interfaces:**
- Consumes: Task 2 editorial hooks and current brand variables.
- Produces: shared editorial tokens, fluid type, global grain, fixed header, monumental hero, and a coherent first viewport.

- [ ] **Step 1: Run the failing token/style contract**

```powershell
$variables = Get-Content -Raw css/variables.css
$hero = Get-Content -Raw css/hero.css
$globals = Get-Content -Raw css/globals.css
if (-not $variables.Contains('--display-size:')) { throw 'Missing --display-size' }
if (-not $variables.Contains('--panel-radius:')) { throw 'Missing --panel-radius' }
if (-not $hero.Contains('[data-hero-media]')) { throw 'Missing hero media hook styles' }
if (-not $globals.Contains('.section-meta')) { throw 'Missing section metadata styles' }
```

Expected: FAIL on all new contracts.

- [ ] **Step 2: Extend brand tokens without changing the palette**

Add these exact token responsibilities to `:root`:

```css
--display-size: clamp(4rem, 10.8vw, 10.5rem);
--section-title-size: clamp(3rem, 7vw, 7.2rem);
--panel-radius: clamp(1rem, 2vw, 1.75rem);
--space-section: clamp(6rem, 13vw, 12rem);
--shadow-deep: 0 50px 140px rgba(0, 0, 0, .48);
--header-pad: clamp(.85rem, 2vw, 1.4rem);
```

Keep every existing color value, especially `--bg: #080a0c` and `--blue: #4cc9ff`.

- [ ] **Step 3: Implement the global editorial system**

Add:

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  opacity: .035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
}

.section-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: .75rem;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.section-meta [data-section-index] { color: var(--blue); }
```

Style headings with tight editorial line-height, keep minimum 44px targets, preserve visible focus, and add mask utilities for `[data-title-line]` and `[data-reveal-line]`.

- [ ] **Step 4: Rebuild the header and hero**

The header remains fixed and gains a compact floating treatment only after `.is-scrolled`. The hero uses a two-phase layout: copy dominates the first viewport; `[data-hero-media]` begins below/behind it as a rounded inset frame with `transform-origin: center top`, dark/blue overlays, and a minimum height that still exposes video on small screens.

Required CSS contracts:

```css
[data-hero-title] { font-size: var(--display-size); line-height: .82; }
[data-title-line] { display: block; overflow: hidden; }
[data-hero-media] { position: absolute; overflow: hidden; border-radius: var(--panel-radius); }
.site-header.is-scrolled { backdrop-filter: blur(22px); }
```

- [ ] **Step 5: Re-run the style contract and static smoke check**

Run the Step 1 command again. Expected: PASS.

Then serve the site and request the exact local URL:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

```powershell
$response = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4173/
if ($response.StatusCode -ne 200) { throw "HTTP $($response.StatusCode)" }
```

Expected: HTTP 200. This is the first meaningful preview gate; attempt the available Sites/browser handoff once and continue if that surface is unavailable.

- [ ] **Step 6: Commit the visual foundation**

```powershell
git add css/variables.css css/reset.css css/globals.css css/header.css css/hero.css
git commit -m "feat: establish editorial visual system"
```

---

### Task 4: Implement the Bounded Preloader and Motion Profiles

**Files:**
- Modify: `js/preloader.js`
- Modify: `js/animations.js`
- Modify: `js/main.js`
- Modify: `css/preloader.css`

**Interfaces:**
- Produces: `getPreloaderProgress(elapsedMs: number, durationMs: number): number`.
- Produces: `getMotionProfile({ width, height, reduced, pointerFine }): "static" | "compact" | "full"`.
- Produces: `initPreloader(options?: { timeoutMs?: number }): Promise<void>`.
- Consumes later: motion profile from every animation initializer.

- [ ] **Step 1: Run failing pure-function checks**

```powershell
node --experimental-default-type=module --input-type=module -e "import { getPreloaderProgress } from './js/preloader.js'; if (getPreloaderProgress(500,1000) !== 0.5) process.exit(1)"
node --experimental-default-type=module --input-type=module -e "import { getMotionProfile } from './js/animations.js'; if (getMotionProfile({width:1440,height:900,reduced:false,pointerFine:true}) !== 'full') process.exit(1)"
```

Expected: both commands FAIL because the exports do not exist.

- [ ] **Step 2: Add the pure helpers**

Implement:

```js
export function getPreloaderProgress(elapsedMs, durationMs) {
  if (durationMs <= 0) return 1;
  return Math.min(Math.max(elapsedMs / durationMs, 0), 1);
}
```

```js
export function getMotionProfile({ width, height, reduced, pointerFine }) {
  if (reduced) return "static";
  if (width < 760 || height < 620 || !pointerFine) return "compact";
  return "full";
}
```

- [ ] **Step 3: Rebuild `initPreloader()` with a guaranteed release**

Keep the percentage, bar, session-shortened visit, and Promise interface. Use `getPreloaderProgress()`, set `aria-hidden="true"` before removal, add `site-ready`, and guarantee teardown no later than `timeoutMs` (default `2400`) even if animation scheduling stalls. Clear the timeout on normal completion.

- [ ] **Step 4: Isolate optional enhancement failures in `main.js`**

Use this initialization shape:

```js
document.documentElement.classList.add("has-js");

function safelyInitialize(initializer) {
  try {
    return initializer();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// render data and initialize navigation/form/FAQ/WhatsApp first
initPreloader().finally(() => {
  safelyInitialize(initHeroVideo);
  safelyInitialize(initCursor);
  safelyInitialize(initAnimations);
});
```

Do not let animation failure stop navigation, FAQ, form, WhatsApp, skills, or projects.

- [ ] **Step 5: Style the editorial preloader**

Implement a top status line, oversized clipped RSoftware wordmark, thin blue progress bar, and vertical curtain. `.is-complete` must translate the curtain and preloader out of view; `.site-ready` restores normal page interaction.

- [ ] **Step 6: Re-run pure checks and syntax validation**

Run the Step 1 commands again. Expected: PASS.

```powershell
Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE) { throw "Syntax: $($_.Name)" } }
```

Expected: every module passes.

- [ ] **Step 7: Commit motion foundations**

```powershell
git add js/preloader.js js/animations.js js/main.js css/preloader.css
git commit -m "feat: add bounded motion foundation"
```

---

### Task 5: Recompose About, Services, Skills, and Projects

**Files:**
- Modify: `css/about.css`
- Modify: `css/services.css`
- Modify: `css/skills.css`
- Modify: `css/projects.css`
- Modify: `js/skills.js`
- Modify: `js/projects.js`

**Interfaces:**
- Produces: `[data-skill-marquee]`, `[data-skills-stage]`, and `[data-skill-item]` markup from `renderSkills()`.
- Produces: `[data-project-panel]` and `[data-project-content]` markup from `renderProjects()`.
- Preserves: `skills`, `projects`, `getTechnologyIcon()`, attribute escaping, and current placeholder semantics.

- [ ] **Step 1: Run failing renderer contracts**

```powershell
node --experimental-default-type=module --input-type=module -e "import {renderSkills} from './js/skills.js'; const c={innerHTML:''}; renderSkills(c); if (!c.innerHTML.includes('data-skill-marquee') || !c.innerHTML.includes('data-skills-stage') || !c.innerHTML.includes('data-skill-item')) process.exit(1)"
node --experimental-default-type=module --input-type=module -e "import {renderProjects,projects} from './js/projects.js'; const c={innerHTML:''}; renderProjects(c,[projects[0]]); if (!c.innerHTML.includes('data-project-panel') || !c.innerHTML.includes('data-project-content')) process.exit(1)"
```

Expected: FAIL because the new hooks are absent.

- [ ] **Step 2: Update `renderSkills()` while preserving every data string**

Render one noninteractive marquee and one semantic stage:

```js
const marqueeItems = [...list, ...list]
  .map((skill) => `<span><img src="${skill.logo}" alt="" width="24" height="24">${skill.name}</span>`)
  .join("");

container.innerHTML = `
  <div class="skills__marquee" data-skill-marquee aria-hidden="true">
    <div>${marqueeItems}</div>
  </div>
  <div class="skills__stage" data-skills-stage>
    ${list.map((skill, index) => `
      <article class="skill-item" data-skill-item data-cursor="skill" style="--i:${index}">
        <!-- retain both current images, name, copy, and use strings -->
      </article>
    `).join("")}
  </div>`;
```

- [ ] **Step 3: Add project animation hooks without changing data or escaping**

Change only the project wrapper/content hooks:

```html
<article class="project-panel" data-project data-project-panel>
  <!-- current media, overlay, and index -->
  <div class="project-panel__content" data-project-content>
    <!-- current category, title, description, technology icons, and action -->
  </div>
</article>
```

- [ ] **Step 4: Rebuild the four section layouts**

- `about.css`: full-width manifesto grid, oversized heading, restrained photo crop, blue typographic accent, no replacement copy.
- `services.css`: four near-viewport sticky panels using existing images, large numbers, alternating image/blue/graphite treatments through `:nth-child()`.
- `skills.css`: overflow-hidden marquee plus a two-row layered stage; keep eight semantic articles in DOM order.
- `projects.css`: full-width immersive panels with deep shadow, oversized index, readable gradient, and sticky offsets derived from `--i` or `:nth-child()`.

Every image-backed card must keep a solid/gradient background beneath the image so text stays readable if the remote image fails.

- [ ] **Step 5: Re-run renderer contracts and syntax checks**

Run the Step 1 commands again. Expected: PASS.

```powershell
node --check js/skills.js
node --check js/projects.js
```

Expected: PASS.

- [ ] **Step 6: Commit the editorial content sections**

```powershell
git add css/about.css css/services.css css/skills.css css/projects.css js/skills.js js/projects.js
git commit -m "feat: recompose editorial content sections"
```

---

### Task 6: Build the Scroll-Driven Service, Skill, Project, and Process Sequences

**Files:**
- Modify: `js/animations.js`
- Modify: `js/process.js`
- Modify: `css/process.css`

**Interfaces:**
- Produces: `getPanelScrollDistance(count: number, viewportHeight: number, profile: string): number`.
- Produces: `setProcessProgress(activeIndex: number, count: number, progressElement?: Element): void`.
- Produces internal initializers: `initGlobalReveals`, `initHeroSequence`, `initPanelStack`, `initSkillsSequence`, `initProcessSequence`.
- Consumes: Task 4 `getMotionProfile()` and Task 5 section hooks.

- [ ] **Step 1: Run failing pure behavior checks**

```powershell
node --experimental-default-type=module --input-type=module -e "import {getPanelScrollDistance} from './js/animations.js'; if (getPanelScrollDistance(4,900,'full') !== 2700) process.exit(1)"
node --experimental-default-type=module --input-type=module -e "import {setProcessProgress} from './js/process.js'; const p={style:{}}; setProcessProgress(2,6,p); if (p.style.transform !== 'scaleY(0.5)') process.exit(1)"
```

Expected: FAIL because the exports do not exist.

- [ ] **Step 2: Add deterministic motion helpers**

```js
export function getPanelScrollDistance(count, viewportHeight, profile) {
  if (profile === "static" || count <= 1) return 0;
  const factor = profile === "compact" ? 0.55 : 1;
  return Math.round((count - 1) * viewportHeight * factor);
}
```

```js
export function setProcessProgress(activeIndex, count, progressElement = document.querySelector("[data-process-progress]")) {
  if (!progressElement || count <= 0) return;
  const bounded = Math.min(Math.max(activeIndex, 0), count - 1);
  progressElement.style.transform = `scaleY(${(bounded + 1) / count})`;
}
```

- [ ] **Step 3: Split animation orchestration into focused initializers**

`initAnimations()` must:

1. Detect `static`, `compact`, or `full` profile.
2. Add `motion-static`, `motion-compact`, or `motion-full` to `<body>`.
3. Return before hiding/translating content if GSAP or ScrollTrigger is missing.
4. Register ScrollTrigger once.
5. Create one `gsap.context()` and one `gsap.matchMedia()` scope.
6. Call the five internal initializers.
7. Refresh ScrollTrigger after fonts and rendered data settle.
8. Return a cleanup function that reverts context and media listeners.

- [ ] **Step 4: Implement the hero and global reveals**

- Hero title lines animate from `yPercent: 110`, `rotation: 1.5`, and `opacity: 0` to rest with stagger `0.08`.
- Copy and CTA follow the title.
- `[data-hero-media]` scales from approximately `.72` to `1`, reduces border radius, and shifts its overlay during the first scroll segment.
- `[data-reveal-line]` and current `[data-reveal]` elements animate once from short vertical distance and mild blur.

- [ ] **Step 5: Implement service and project stacks**

Use one `initPanelStack(selector, options)` helper for `[data-service-card]` and `[data-project-panel]`. Each panel after the first enters from `y: 96`, `scale: .94`, `opacity: .72`, and `filter: "blur(12px)"`, then settles at its CSS sticky position. Full profile uses scrubbed timelines; compact profile uses shorter non-pinned reveals; static profile does nothing.

- [ ] **Step 6: Implement skills and process sequences**

- Skills: continuously translate the inner marquee by 50% with linear repeat only in full/compact motion, then reveal `[data-skill-item]` with stagger and alternating `rotationZ` no greater than 1.5 degrees.
- Process: full profile pins `[data-process-stage]` for `getPanelScrollDistance(6, innerHeight, profile)`, crossfades each adjacent step, and calls `setProcessProgress(index, 6)` at labeled timeline boundaries.
- Compact/static: restore all six process steps to normal vertical flow and use intersection-based progress only when motion is compact.

- [ ] **Step 7: Rebuild process stage CSS**

Use one stable stage with overlaid steps only under `.motion-full`. Default CSS must remain normal flow. `.motion-full .process__steps` creates the stage; `.motion-full .process-step` overlays the same grid area; `.motion-static` and `.motion-compact` explicitly restore relative positioning and opacity.

- [ ] **Step 8: Re-run behavior and syntax checks**

Run the Step 1 commands again. Expected: PASS.

```powershell
node --check js/animations.js
node --check js/process.js
```

Expected: PASS.

- [ ] **Step 9: Commit scroll narratives**

```powershell
git add js/animations.js js/process.js css/process.css
git commit -m "feat: add editorial scroll narratives"
```

---

### Task 7: Add Interaction Polish and Closing Sections

**Files:**
- Modify: `js/cursor.js`
- Modify: `js/faq.js`
- Modify: `css/cursor.css`
- Modify: `css/faq.css`
- Modify: `css/contact.css`
- Modify: `css/footer.css`

**Interfaces:**
- Produces: `getMagneticOffset(pointerX, pointerY, rect, strength): { x: number, y: number }`.
- Produces: `getFaqAnimationFrames(open: boolean, height: number): Keyframe[]`.
- Preserves: existing FAQ `aria-expanded`/`aria-controls`, form labels/errors/status, WhatsApp attributes, and footer links.

- [ ] **Step 1: Run failing interaction helper checks**

```powershell
node --experimental-default-type=module --input-type=module -e "import {getMagneticOffset} from './js/cursor.js'; const v=getMagneticOffset(75,50,{left:0,top:0,width:100,height:100},0.2); if (v.x !== 5 || v.y !== 0) process.exit(1)"
node --experimental-default-type=module --input-type=module -e "import {getFaqAnimationFrames} from './js/faq.js'; const f=getFaqAnimationFrames(true,120); if (f[1].height !== '120px' || f[1].opacity !== 1) process.exit(1)"
```

Expected: FAIL because the helpers do not exist.

- [ ] **Step 2: Implement magnetic offsets and bounded cursor animation**

```js
export function getMagneticOffset(pointerX, pointerY, rect, strength = 0.2) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    x: Math.round((pointerX - centerX) * strength * 100) / 100,
    y: Math.round((pointerY - centerY) * strength * 100) / 100
  };
}
```

Enable magnetic transforms only for `[data-magnetic]` on fine pointers without reduced motion. Reset transforms on pointer leave and cancel the cursor animation frame on page hide.

- [ ] **Step 3: Implement accessible FAQ height animation**

```js
export function getFaqAnimationFrames(open, height) {
  return open
    ? [{ height: "0px", opacity: 0 }, { height: `${height}px`, opacity: 1 }]
    : [{ height: `${height}px`, opacity: 1 }, { height: "0px", opacity: 0 }];
}
```

Set `hidden = false` before opening. On close, keep the panel available during the animation, then set `hidden = true` when the animation finishes. If `Element.animate` is unavailable or reduced motion is active, toggle `hidden` immediately. Keep `aria-expanded` authoritative.

- [ ] **Step 4: Recompose FAQ, contact, and footer CSS**

- FAQ rows use oversized responsive question type, numbered rhythm through CSS counters, thin dividers, and blue active-state accents.
- Contact uses a two-column monumental layout with the current form on a graphite panel, current WhatsApp action, and current copy.
- Footer uses a large RSoftware wordmark treatment, compact current navigation, and the current legal text.
- Cursor changes from a 170px glow into a compact ring/dot system with link, CTA, skill, and project states; coarse pointers hide it.

- [ ] **Step 5: Re-run interaction and syntax checks**

Run the Step 1 commands again. Expected: PASS.

```powershell
node --check js/cursor.js
node --check js/faq.js
```

Expected: PASS.

- [ ] **Step 6: Commit interaction polish**

```powershell
git add js/cursor.js js/faq.js css/cursor.css css/faq.css css/contact.css css/footer.css
git commit -m "feat: polish editorial interactions"
```

---

### Task 8: Complete Responsive and Reduced-Motion Behavior

**Files:**
- Modify: `css/responsive.css`
- Modify: `css/reset.css`
- Modify: `js/animations.js`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: all motion classes and hooks from Tasks 2-7.
- Produces: usable full, compact, static, coarse-pointer, and short-viewport presentations.

- [ ] **Step 1: Run the failing fallback contract**

```powershell
$responsive = Get-Content -Raw css/responsive.css
$required = @(
  '@media (max-width: 760px)',
  '@media (max-height: 620px)',
  '@media (pointer: coarse)',
  '@media (prefers-reduced-motion: reduce)',
  '.motion-static',
  '.motion-compact'
)
$missing = $required | Where-Object { -not $responsive.Contains($_) }
if ($missing) { throw "Missing responsive contracts: $($missing -join ', ')" }
```

Expected: FAIL because the full fallback matrix is incomplete.

- [ ] **Step 2: Implement tablet and mobile compositions**

- At `980px`, collapse contact/about grids, keep service/project panels readable, and use the full-screen existing mobile menu.
- At `760px`, reduce display type, convert sticky service/project stacks into shorter sticky or normal-flow cards depending on `.motion-compact`, and make every CTA/form control full-width only when it improves fit.
- At `560px`, prevent title clipping at 320 CSS pixels, use single-column skill panels, and preserve 44px targets.

- [ ] **Step 3: Implement short-viewport and coarse-pointer fallbacks**

At `max-height: 620px`, unpin process, limit media height, reduce section gaps, and keep mobile navigation scrollable. At `pointer: coarse`, hide cursor and remove magnetic transforms/hover-only displacement.

- [ ] **Step 4: Implement explicit static-motion restoration**

Under reduced motion and `.motion-static`:

```css
.motion-static [data-title-line],
.motion-static [data-reveal],
.motion-static [data-service-card],
.motion-static [data-project-panel],
.motion-static [data-skill-item],
.motion-static [data-process-step] {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  filter: none !important;
}
```

Stop marquee animation, remove sticky/pinned stage assumptions, and restore all content to normal DOM flow.

- [ ] **Step 5: Rebuild motion when geometry changes**

In `main.js`, retain the cleanup returned by `initAnimations()`. On breakpoint-profile changes, call cleanup once and initialize a fresh motion context. Use `matchMedia` change events instead of rebuilding on every resize event.

- [ ] **Step 6: Re-run fallback and syntax contracts**

Run the Step 1 command again. Expected: PASS.

```powershell
node --check js/animations.js
node --check js/main.js
```

Expected: PASS.

- [ ] **Step 7: Commit responsive behavior**

```powershell
git add css/responsive.css css/reset.css js/animations.js js/main.js
git commit -m "feat: complete responsive motion fallbacks"
```

---

### Task 9: Verify, Review, Package, and Publish

**Files:**
- Verify: `index.html`, `assets/**`, `css/**`, `js/**`, `.openai/hosting.json`, `robots.txt`, `sitemap.xml`
- Modify only if verification finds a concrete defect.

**Interfaces:**
- Consumes: the complete redesigned static root.
- Produces: a verified commit, saved Sites version, and production deployment on the existing project/audience.

- [ ] **Step 1: Run complete JavaScript syntax verification**

```powershell
$failures = @()
Get-ChildItem js -Filter *.js -File | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { $failures += $_.Name }
}
if ($failures) { throw "Syntax failures: $($failures -join ', ')" }
```

Expected: no failures.

- [ ] **Step 2: Verify local references and accessibility structure**

```powershell
$html = Get-Content -Raw index.html
$localRefs = [regex]::Matches($html, '(?:src|href)="((?:assets|css|js)/[^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$missing = $localRefs | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { throw "Missing assets: $($missing -join ', ')" }
if (($html | Select-String -Pattern '<h1\b' -AllMatches).Matches.Count -ne 1) { throw 'Expected one h1' }
if (-not $html.Contains('href="#conteudo"')) { throw 'Missing skip link' }
if (-not $html.Contains('aria-live="polite"')) { throw 'Missing live form status' }
if (-not $html.Contains('prefers-reduced-motion')) { Write-Output 'Reduced motion is defined in CSS, not HTML' }
```

Expected: no missing files; one `h1`; skip link and live region present.

- [ ] **Step 3: Smoke-test every critical local asset**

Start:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then:

```powershell
$urls = @(
  'http://127.0.0.1:4173/',
  'http://127.0.0.1:4173/css/globals.css',
  'http://127.0.0.1:4173/js/main.js',
  'http://127.0.0.1:4173/assets/images/rsoftware-logo.jpeg',
  'http://127.0.0.1:4173/assets/video/hero-programador.mp4',
  'http://127.0.0.1:4173/robots.txt',
  'http://127.0.0.1:4173/sitemap.xml'
)
foreach ($url in $urls) {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url
  if ($response.StatusCode -ne 200) { throw "$url returned $($response.StatusCode)" }
}
```

Expected: every URL returns HTTP 200. Stop the server afterward.

- [ ] **Step 4: Exercise interactive behavior**

Use the available local preview/browser surface once to verify:

- Desktop: preloader releases, hero title/video sequence runs, service/project stacks remain readable, process reaches all six steps, FAQ opens/closes, form reports validation, WhatsApp anchors receive the configured URL.
- Mobile: menu opens, traps page interaction using existing `inert` behavior, closes by link/Escape, no horizontal overflow, content is not trapped by pinning.
- Reduced motion: every section and process step is visible; marquee/cursor/pinning/parallax are absent.
- Failed optional motion: temporarily block GSAP in the preview and confirm normal-flow content remains visible.

Expected: no hidden content, clipped title, focus loss, broken CTA, or scroll trap.

- [ ] **Step 5: Run code-quality checks**

```powershell
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace errors found' }
rg -n --hidden --glob '!.git/**' '\bdist(?:/|\\|\b)' .
```

Expected: `git diff --check` passes. The only acceptable `dist` occurrence in active site code is the external Lucide CDN path segment.

- [ ] **Step 6: Request code review and fix verified defects**

Use `superpowers:requesting-code-review` against the implementation range. Apply `superpowers:receiving-code-review` before accepting any review suggestion. Re-run Steps 1-5 after each accepted correction.

- [ ] **Step 7: Commit the verified release state**

```powershell
git status --short
git add index.html assets css js .openai robots.txt sitemap.xml README.md
git commit -m "feat: deliver RSoftware editorial redesign"
git rev-parse --verify HEAD
```

Expected: capture the full 40-character commit SHA from the final command.

- [ ] **Step 8: Package and publish with Sites**

Invoke `sites:sites-hosting` and follow its static-site packaging workflow using the existing project ID from `.openai/hosting.json`. Push the exact final commit, package the directory declared by `static.directory`, save a Sites version with the exact commit SHA, deploy that saved version, preserve the current access policy, and inspect deployment status until it is terminal.

Expected: deployment status succeeds and returns the existing site's production URL.

- [ ] **Step 9: Report the deliverable**

Provide the production URL, summarize the preserved content/identity and replaced layout/motion system, report verification evidence, and mention any intentionally simplified mobile/reduced-motion behavior.
