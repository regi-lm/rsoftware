# RSoftware Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete premium institutional website for RSoftware as a static Vanilla HTML/CSS/JS site.

**Architecture:** Static authored files live under `dist/`, with modular CSS per section and modular ES JavaScript per behavior. Tests exercise pure JS modules before browser integration.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, GSAP + ScrollTrigger CDN, Three.js CDN, Lucide CDN, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-10-rsoftware-site-design.md`

## Global Constraints

- Use the supplied RSoftware logo without redesigning it.
- Keep WhatsApp number, form endpoint, and social profiles empty/configurable unless provided.
- Do not invent projects, testimonials, prices, deadlines, addresses, phone numbers, metrics, or social links.
- Keep the build Vanilla HTML/CSS/JS with no framework and no backend.
- Preserve accessibility, responsive behavior, reduced motion, SEO metadata, and progressive enhancement.

---

### Task 1: Testable Configuration And Data

**Files:**
- Create: `package.json`
- Create: `tests/config.test.js`
- Create: `tests/form.test.js`
- Create: `tests/projects.test.js`
- Create: `dist/js/config.js`
- Create: `dist/js/form.js`
- Create: `dist/js/projects.js`

**Interfaces:**
- Produces: `CONFIG`, `getWhatsAppHref()`, `validateContactForm(data)`, `projects`.

- [ ] Write tests for empty WhatsApp fallback, configured WhatsApp URL, form validation, and project placeholder shape.
- [ ] Run `npm test` and confirm tests fail because production modules do not exist.
- [ ] Implement production modules.
- [ ] Run `npm test` and confirm pass.

### Task 2: Static Site Structure And Assets

**Files:**
- Create: `dist/index.html`
- Create: `dist/assets/images/rsoftware-logo.jpeg`
- Create: `dist/robots.txt`
- Create: `dist/sitemap.xml`
- Create: `.openai/hosting.json`

**Interfaces:**
- Consumes: JS modules from Task 1.
- Produces: semantic page structure and static hosting metadata.

- [ ] Copy the supplied logo into `dist/assets/images/`.
- [ ] Build semantic HTML with all required sections, metadata, Schema.org, accessible controls, and anchors.
- [ ] Add static hosting metadata pointing at `dist`.

### Task 3: Visual System And Responsive CSS

**Files:**
- Create: `dist/css/variables.css`
- Create: `dist/css/reset.css`
- Create: `dist/css/globals.css`
- Create: `dist/css/preloader.css`
- Create: `dist/css/header.css`
- Create: `dist/css/hero.css`
- Create: `dist/css/about.css`
- Create: `dist/css/skills.css`
- Create: `dist/css/projects.css`
- Create: `dist/css/process.css`
- Create: `dist/css/faq.css`
- Create: `dist/css/contact.css`
- Create: `dist/css/footer.css`
- Create: `dist/css/cursor.css`
- Create: `dist/css/responsive.css`

**Interfaces:**
- Consumes: class names and IDs from `dist/index.html`.
- Produces: full visual system, layout, responsive behavior, and reduced-motion styles.

- [ ] Add tokens and reset.
- [ ] Style each section according to the matte black/celestial blue design.
- [ ] Add mobile and reduced-motion behavior.

### Task 4: Browser Behaviors And Motion

**Files:**
- Create: `dist/js/main.js`
- Create: `dist/js/preloader.js`
- Create: `dist/js/cursor.js`
- Create: `dist/js/navigation.js`
- Create: `dist/js/hero-three.js`
- Create: `dist/js/animations.js`
- Create: `dist/js/skills.js`
- Create: `dist/js/process.js`
- Create: `dist/js/faq.js`

**Interfaces:**
- Consumes: DOM from `dist/index.html`, data/config modules, GSAP/Three globals.
- Produces: preloader, navigation, FAQ, skills rendering, projects rendering, form behavior, cursor, Three.js hero, and scroll motion.

- [ ] Implement progressive-enhancement initializers.
- [ ] Guard every advanced feature for missing libraries and reduced motion.
- [ ] Render projects and skills from data.
- [ ] Wire accessible navigation, FAQ, form, and WhatsApp states.

### Task 5: Documentation And Verification

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: completed static site.
- Produces: operating instructions for local development, config, projects, form, WhatsApp, images, and Vercel/static deploy.

- [ ] Write README.
- [ ] Run `npm test`.
- [ ] Run syntax checks for JS.
- [ ] Serve `dist` locally and smoke-test `index.html`.
