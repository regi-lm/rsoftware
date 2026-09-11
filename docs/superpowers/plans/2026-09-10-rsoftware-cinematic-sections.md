# RSoftware Cinematic Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero visual with the supplied silent looping video, enrich cards with relevant imagery, standardize WhatsApp actions, and deliver pinned cinematic scroll narratives across desktop and mobile.

**Architecture:** Keep the existing static HTML/CSS/JavaScript structure. Add only one focused data helper for technology icons, keep WhatsApp URL generation in `config.js`, and split the GSAP orchestration in `animations.js` into four internal section initializers with static fallbacks.

**Tech Stack:** HTML5 video, CSS Grid/Sticky positioning, JavaScript ES modules, GSAP 3.12.5 with ScrollTrigger, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-10-rsoftware-cinematic-sections-design.md`

## Global Constraints

- Preserve the existing dark palette and blue `#4cc9ff` brand accent.
- Use WhatsApp number `+5591984536649` and message `Olá! Vim pelo site da RSoftware e gostaria de ter um forte posicionamento online.`
- Keep the form submit action independent from WhatsApp.
- The hero video must autoplay, remain muted, loop, use `playsinline`, and continue under `prefers-reduced-motion`.
- Use Pinterest only for visual direction and use Unsplash-hosted photography in the delivered site.
- Services, Skills, Projects, and Process must retain their scroll narratives on mobile.
- Center the legal paragraph inside the mobile menu footer.
- Reduced-motion mode removes pinning, scrub, blur, and rotation from section animations, but not video playback.
- Do not publish the existing Site without a separate explicit publish request.

## File Structure

- Create `dist/assets/video/hero-programador.mp4` — local hero media copied byte-for-byte from the supplied file.
- Create `dist/js/technology-icons.js` — canonical technology-name-to-icon mapping and lookup fallback.
- Create `tests/site-structure.test.js` — final HTML contracts for video, imagery, FAQ, and floating WhatsApp control.
- Create `tests/technology-icons.test.js` — icon lookup and project-rendering contracts.
- Create `tests/animations.test.js` — pure skill-pair mapping and animation configuration contracts.
- Modify `dist/index.html` — video, service/process imagery, normalized FAQ label, WhatsApp markup, floating action.
- Modify `dist/js/config.js` — real WhatsApp number and forwarding message.
- Modify `dist/js/main.js` — remove Three.js hero initialization and initialize silent video defensively.
- Modify `dist/js/projects.js` — render technology icons and service-shaped project content.
- Modify `dist/js/animations.js` — isolated Service, Skills, Project, and Process scroll initializers.
- Modify `dist/js/process.js` — expose progress updates driven by the active process step.
- Modify `dist/css/hero.css`, `services.css`, `skills.css`, `projects.css`, `process.css`, `faq.css`, `contact.css`, `globals.css`, and `responsive.css` — visuals, overlays, stacks, pinning fallbacks, WhatsApp styles, and responsive behavior.

---

### Task 1: WhatsApp configuration and actions

**Files:**
- Modify: `tests/config.test.js`
- Modify: `dist/js/config.js`
- Modify: `dist/index.html`
- Modify: `dist/css/globals.css`
- Modify: `dist/css/contact.css`
- Create: `tests/site-structure.test.js`

**Interfaces:**
- Consumes: `getWhatsAppHref(config = CONFIG): string | null`.
- Produces: every `[data-whatsapp]` anchor receives the same encoded URL; `.whatsapp-float` is the fixed accessible shortcut.

- [ ] **Step 1: Write failing URL and markup tests**

```js
test("uses the production WhatsApp destination and forwarding message", () => {
  assert.equal(
    getWhatsAppHref(),
    "https://wa.me/5591984536649?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20RSoftware%20e%20gostaria%20de%20ter%20um%20forte%20posicionamento%20online."
  );
});

test("ships an accessible floating WhatsApp action", async () => {
  const html = await readFile(indexUrl, "utf8");
  assert.match(html, /class="whatsapp-float"[^>]*data-whatsapp/);
  assert.match(html, /aria-label="Falar no WhatsApp"/);
});
```

- [ ] **Step 2: Run tests and verify the expected failures**

Run: `node --test tests/config.test.js tests/site-structure.test.js`  
Expected: FAIL because the configured number is empty and `.whatsapp-float` is absent.

- [ ] **Step 3: Configure the destination and add shared markup**

```js
export const CONFIG = {
  siteName: "RSoftware",
  canonicalUrl: "https://rsoftware-site.regi-lima.chatgpt.site/",
  whatsappNumber: "+5591984536649",
  whatsappMessage: "Olá! Vim pelo site da RSoftware e gostaria de ter um forte posicionamento online.",
  formEndpoint: "",
  socialLinks: []
};
```

Use `https://cdn.simpleicons.org/whatsapp/ffffff` for the white official mark in the hero CTA, Contact CTA, and floating anchor. Change the Contact caption to `Falar no WhatsApp`. Keep the form submit button unchanged. Add:

```html
<a class="whatsapp-float" href="#" data-whatsapp aria-label="Falar no WhatsApp">
  <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" width="26" height="26">
</a>
```

- [ ] **Step 4: Style all WhatsApp actions**

Apply `background: #25d366`, white foreground, a 44 px minimum hit target, green focus/hover glow, and safe-area-aware fixed offsets. Give the mobile menu a higher stacking level than the floating control. Change `.site-nav__footer p` to centered alignment at the mobile breakpoint.

- [ ] **Step 5: Run the focused tests**

Run: `node --test tests/config.test.js tests/site-structure.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/config.test.js tests/site-structure.test.js dist/js/config.js dist/index.html dist/css/globals.css dist/css/contact.css
git commit -m "feat: configure WhatsApp actions"
```

---

### Task 2: Silent looping hero video and section spacing

**Files:**
- Create: `dist/assets/video/hero-programador.mp4`
- Modify: `tests/site-structure.test.js`
- Modify: `dist/index.html`
- Modify: `dist/css/hero.css`
- Modify: `dist/css/services.css`
- Modify: `dist/js/main.js`

**Interfaces:**
- Consumes: supplied H.264 MP4 at the exact path recorded in the spec.
- Produces: `[data-hero-video]` with a silent autoplay contract and no Three.js runtime dependency.

- [ ] **Step 1: Add failing hero structure tests**

```js
test("uses the local silent looping video as the hero background", async () => {
  const html = await readFile(indexUrl, "utf8");
  assert.match(html, /<video[^>]*data-hero-video[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline/);
  assert.match(html, /assets\/video\/hero-programador\.mp4/);
  assert.doesNotMatch(html, /three\.min\.js|data-hero-canvas/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/site-structure.test.js`  
Expected: FAIL because the hero still contains the canvas and Three.js script.

- [ ] **Step 3: Copy the video and replace the hero visual**

Run:

```powershell
New-Item -ItemType Directory -Force -Path dist/assets/video
Copy-Item -LiteralPath 'C:\Users\REGINALDO LIMA\Downloads\Programador_digitando_em_notebook_20260910203555.mp4' -Destination 'dist/assets/video/hero-programador.mp4'
```

Replace the canvas/fallback markup with:

```html
<div class="hero__visual" aria-hidden="true">
  <video data-hero-video autoplay muted loop playsinline preload="metadata">
    <source src="assets/video/hero-programador.mp4" type="video/mp4">
  </video>
</div>
```

Remove the Three.js script, `initHeroThree` import, and call. In `main.js`, set `video.defaultMuted = true` and retry `video.play()` without surfacing a rejected autoplay promise.

- [ ] **Step 4: Implement video cover and spacing CSS**

Make `.hero__visual` cover the full hero, place the video with `object-fit: cover`, and add a dark/blue pseudo-element overlay. Increase `.services` top padding independently so the preserved About section has a stronger visual break before Services.

- [ ] **Step 5: Verify the media file and focused tests**

Run: `Get-Item dist/assets/video/hero-programador.mp4 | Select-Object Length`  
Expected: `1764151` bytes.

Run: `node --test tests/site-structure.test.js`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/site-structure.test.js dist/assets/video/hero-programador.mp4 dist/index.html dist/css/hero.css dist/css/services.css dist/js/main.js
git commit -m "feat: add cinematic hero video"
```

---

### Task 3: Service and Process photography

**Files:**
- Modify: `tests/site-structure.test.js`
- Modify: `dist/index.html`
- Modify: `dist/css/services.css`
- Modify: `dist/css/process.css`
- Modify: `dist/css/responsive.css`

**Interfaces:**
- Consumes: ten distinct optimized `images.unsplash.com` URLs.
- Produces: decorative `.card-media` images in every Service and Process card.

- [ ] **Step 1: Add failing image-count and FAQ tests**

```js
test("adds contextual media to every service and process card", async () => {
  const html = await readFile(indexUrl, "utf8");
  assert.equal((html.match(/class="service-card__media"/g) ?? []).length, 4);
  assert.equal((html.match(/class="process-step__media"/g) ?? []).length, 6);
});

test("keeps the third FAQ label in one text wrapper", async () => {
  const html = await readFile(indexUrl, "utf8");
  const faq3 = html.match(/aria-controls="faq-3"[\s\S]*?<\/button>/)?.[0] ?? "";
  assert.match(faq3, /<span class="faq__question">A[\s\S]*RSoftware[\s\S]*personalizados\?<\/span>/);
});
```

- [ ] **Step 2: Run and confirm the expected failures**

Run: `node --test tests/site-structure.test.js`  
Expected: FAIL because card images and the unified FAQ wrapper are absent.

- [ ] **Step 3: Add the ten Unsplash images and overlays**

Use distinct URLs with `auto=format&fit=crop&w=1600&q=76`. Assign compositions matching the approved service and process themes. Each image must use `alt=""`, `loading="lazy"`, width/height attributes, and a section-specific media class.

- [ ] **Step 4: Normalize FAQ question three**

Wrap the full visible label, including the styled RSoftware word, inside `<span class="faq__question">...</span>` so the plus icon remains the only other direct flex child.

- [ ] **Step 5: Implement card media CSS and mobile sticky services**

Give cards `isolation: isolate` and `overflow: hidden`; place media at `position: absolute; inset: 0; z-index: -2; object-fit: cover`, and overlays at `z-index: -1`. Remove the responsive rule that changes `.service-card` to `position: relative`; retain scaled mobile heights and progressive sticky offsets.

- [ ] **Step 6: Run focused tests and commit**

Run: `node --test tests/site-structure.test.js`  
Expected: PASS.

```bash
git add tests/site-structure.test.js dist/index.html dist/css/services.css dist/css/process.css dist/css/faq.css dist/css/responsive.css
git commit -m "feat: add contextual card photography"
```

---

### Task 4: Service-shaped Projects with technology icons

**Files:**
- Create: `dist/js/technology-icons.js`
- Create: `tests/technology-icons.test.js`
- Modify: `tests/projects.test.js`
- Modify: `dist/js/projects.js`
- Modify: `dist/css/projects.css`
- Modify: `dist/css/responsive.css`

**Interfaces:**
- Produces: `getTechnologyIcon(name: string): { name: string, src: string }`.
- Consumes: `project.technologies: string[]` in `renderProjects(container, list)`.

- [ ] **Step 1: Write failing icon lookup and rendering tests**

```js
test("maps supported technologies to accessible icon assets", () => {
  assert.match(getTechnologyIcon("React").src, /react/);
  assert.equal(getTechnologyIcon("React").name, "React");
  assert.equal(getTechnologyIcon("Unknown").name, "Unknown");
});

test("renders technology icons instead of text pills", () => {
  const container = { innerHTML: "" };
  renderProjects(container, [projects[0]]);
  assert.match(container.innerHTML, /class="tech-icon"/);
  assert.match(container.innerHTML, /<img[^>]*alt="HTML"/);
  assert.doesNotMatch(container.innerHTML, /<li>HTML<\/li>/);
});
```

- [ ] **Step 2: Run and verify failures**

Run: `node --test tests/technology-icons.test.js tests/projects.test.js`  
Expected: FAIL because the lookup module and icon markup do not exist.

- [ ] **Step 3: Implement icon lookup**

Create a frozen map using Devicon URLs for HTML, CSS, JavaScript, React, Node.js, and Supabase plus `https://cdn.simpleicons.org/greensock/88CE02` for GSAP. Return a neutral data-URI mark for unknown names while preserving the original name.

- [ ] **Step 4: Render icon markup and restructure project cards**

Render each technology as:

```html
<li class="tech-icon" title="HTML">
  <img src="..." alt="HTML" width="28" height="28" loading="lazy">
</li>
```

Reshape the project markup to match Service cards: index column plus foreground copy. Keep `data-project`, category, description, optional action, and image fallback.

- [ ] **Step 5: Implement full-width sticky project stack CSS**

Change `.project-track` to one column, match Service card height/padding, add progressive sticky offsets for three cards, and keep media overlays. Preserve readable icon contrast and 44 px actions.

- [ ] **Step 6: Run focused tests and commit**

Run: `node --test tests/technology-icons.test.js tests/projects.test.js`  
Expected: PASS.

```bash
git add tests/technology-icons.test.js tests/projects.test.js dist/js/technology-icons.js dist/js/projects.js dist/css/projects.css dist/css/responsive.css
git commit -m "feat: redesign project cards with icons"
```

---

### Task 5: Cinematic Service, Skills, Project, and Process timelines

**Files:**
- Create: `tests/animations.test.js`
- Modify: `dist/js/animations.js`
- Modify: `dist/js/process.js`
- Modify: `dist/css/services.css`
- Modify: `dist/css/skills.css`
- Modify: `dist/css/projects.css`
- Modify: `dist/css/process.css`
- Modify: `dist/css/responsive.css`

**Interfaces:**
- Produces: `getSkillOverlayPairs(items: Element[]): Array<{ base: Element, overlay: Element }>` for pair order 1/5 through 4/8.
- Produces internal initializers `initServiceStack`, `initSkillsOverlay`, `initProjectStack`, and `initProcessSequence` called only by `initAnimations()`.
- Consumes: `setProcessProgress(activeIndex: number, count: number)` from `process.js`.

- [ ] **Step 1: Write failing pure mapping tests**

```js
test("pairs the lower four skills over the upper four in order", () => {
  const items = Array.from({ length: 8 }, (_, index) => ({ index }));
  assert.deepEqual(
    getSkillOverlayPairs(items).map(({ base, overlay }) => [base.index, overlay.index]),
    [[0, 4], [1, 5], [2, 6], [3, 7]]
  );
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/animations.test.js`  
Expected: FAIL because `getSkillOverlayPairs` is not exported.

- [ ] **Step 3: Split animation orchestration**

Implement the pure pair helper and four internal initializers. `initAnimations()` must register ScrollTrigger once, run general reveals, skip pinning when reduced motion is active, call all four initializers otherwise, and finish with `ScrollTrigger.refresh()`.

- [ ] **Step 4: Build the Skills overlay timeline**

Place items 5–8 in the same CSS grid cells as items 1–4 at every breakpoint. Create a pinned scrubbed timeline on `.skills__grid` with `end: "+=240%"`. Animate each overlay from `{ y: innerHeight * 0.75, rotationX: 14, rotationZ: alternating ±2, scale: .9, opacity: 0, filter: "blur(14px)" }` to `{ y: 0, rotationX: 0, rotationZ: 0, scale: 1, opacity: 1, filter: "blur(0px)" }` in four sequential segments.

- [ ] **Step 5: Build Service and Project stack timelines**

Apply the same section helper to `[data-service-card]` and `[data-project]`: each card enters from `y: 72`, `scale: .95`, `opacity: .66` and settles to its sticky position with scrub. Run this at all viewport widths; CSS sticky remains the no-JavaScript fallback.

- [ ] **Step 6: Build the Process replacement timeline**

Stack all process articles in one stage, pin `.process` for `+=400%`, keep step one visible initially, and crossfade each outgoing/incoming pair. Outgoing state: `{ opacity: 0, scale: .94, y: -32, filter: "blur(12px)" }`; incoming state: `{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }`. Update the progress line to `(activeIndex + 1) / 6` at each segment.

- [ ] **Step 7: Implement responsive grid placement and fallbacks**

Define explicit nth-child cells for 4-column, 2-column, and 1-column Skills layouts. Keep overlaid cards absolute to their grid cells only while `.has-gsap` is present. Under `.motion-light`, restore all eight cards and six process steps to ordinary document flow. Size pinned stages with `svh` units and cap content heights for landscape phones.

- [ ] **Step 8: Run focused and regression tests**

Run: `node --test tests/animations.test.js tests/navigation.test.js tests/mobile-menu.test.js`  
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add tests/animations.test.js dist/js/animations.js dist/js/process.js dist/css/services.css dist/css/skills.css dist/css/projects.css dist/css/process.css dist/css/responsive.css
git commit -m "feat: add cinematic scroll sequences"
```

---

### Task 6: Complete verification and handoff

**Files:**
- Modify only files required to correct verification failures.

**Interfaces:**
- Consumes: the completed static site.
- Produces: validated local commit with no uncommitted changes.

- [ ] **Step 1: Run the complete test suite explicitly**

Run:

```powershell
node --test tests/config.test.js tests/form.test.js tests/projects.test.js tests/skills.test.js tests/navigation.test.js tests/mobile-menu.test.js tests/site-structure.test.js tests/technology-icons.test.js tests/animations.test.js
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Check every JavaScript module**

Run:

```powershell
Get-ChildItem dist/js/*.js | ForEach-Object { node --check $_.FullName }
```

Expected: exit code 0 with no syntax errors.

- [ ] **Step 3: Validate source hygiene**

Run: `git diff --check`  
Expected: exit code 0.

- [ ] **Step 4: Serve and request the exact static route**

Run `python -m http.server 4173 --directory dist`, retain the process, then request `http://127.0.0.1:4173/` with `Invoke-WebRequest -UseBasicParsing`.  
Expected: HTTP 200 with `Content-Type: text/html`. Stop only the retained preview server after validation.

- [ ] **Step 5: Request read-only code review**

Review every implementation commit against the approved spec. Fix all Critical and Important findings, rerun Steps 1–4, and update the relevant commit.

- [ ] **Step 6: Commit verification-only fixes if any**

```bash
git add -- dist/index.html dist/assets/video/hero-programador.mp4 dist/js/config.js dist/js/main.js dist/js/projects.js dist/js/technology-icons.js dist/js/animations.js dist/js/process.js dist/css/globals.css dist/css/hero.css dist/css/services.css dist/css/skills.css dist/css/projects.css dist/css/process.css dist/css/faq.css dist/css/contact.css dist/css/responsive.css tests/config.test.js tests/projects.test.js tests/site-structure.test.js tests/technology-icons.test.js tests/animations.test.js
git commit -m "fix: address cinematic site review"
```

- [ ] **Step 7: Handoff**

Report the local commit, changed behavior, test count, syntax result, and local HTTP result. State that the existing production URL was not changed and offer publication as a separate explicit action.
