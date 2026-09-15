# RSoftware Componine-Inspired Redesign

## Goal

Redesign the existing RSoftware institutional site with a high-fidelity adaptation of Componine's editorial layout and scroll-driven motion language while preserving RSoftware's complete Portuguese content, section order, brand logo, imagery, functionality, and existing black, graphite, white, and blue palette.

The result must feel structurally and kinetically close to the reference without copying Componine's brand, copy, proprietary media, or source code.

## Approved Constraints

- Preserve every current RSoftware section and all current text.
- Preserve the section order: Hero, Sobre, Serviços, Skills, Projetos, Processo, FAQ, Contato, and Footer.
- Preserve the RSoftware logo, current local hero video, current service and process imagery, project data, skill data, WhatsApp destination, and contact-form behavior.
- Keep the existing palette based on `#080a0c`, graphite surfaces, white text, and `#4cc9ff` blue accents.
- Do not introduce Componine's cream or brown palette.
- Keep the project as static HTML, modular CSS, and vanilla JavaScript.
- Continue using the existing GSAP and ScrollTrigger CDN integrations.
- Do not add a package manager, build step, framework, or `package.json`.
- Preserve `.openai/hosting.json`, `robots.txt`, and `sitemap.xml`.
- Publish the validated redesign to the existing OpenAI Sites project while preserving its current URL and access policy.

## Visual Direction

The interface will translate the reference site's editorial composition into RSoftware's identity:

- Monumental sans-serif headings with tight line-height and deliberate line breaks.
- Oversized section numbers, labels, and typographic moments.
- Strong alternation between near-black, graphite, white, and saturated blue surfaces.
- Thin borders, restrained corner radii, subtle grain/noise, and translucent layers.
- Full-width media frames and large editorial panels rather than conventional small cards.
- High-contrast spacing that alternates dense content with cinematic negative space.
- Motion that is tied to scrolling and reinforces hierarchy rather than decorating every element.

No Componine logos, wording, illustrations, textures, case-study media, or other proprietary assets will be reused.

## Information Architecture

### Header

The fixed header will use a compact editorial bar: RSoftware logo on the left, section navigation in the center, and the existing WhatsApp action on the right. It will be transparent at the top and gain a blurred graphite surface and fine border after scrolling. The mobile navigation will remain keyboard accessible and will use a full-screen high-contrast overlay.

### Hero

The existing eyebrow, headline, supporting copy, CTA, and video will remain. The headline will become the dominant first-viewport element with masked line reveals. The video will begin in a contained editorial frame and expand toward full width as the page scrolls. Blue light and dark overlays will retain legibility without recoloring the source video.

### Sobre

The existing heading becomes a large manifesto. Selected visual emphasis may use the blue accent, but the wording will not change. Supporting copy will be arranged in editorial columns with a large section index and thin rules.

### Serviços

All four existing service cards will become large numbered panels. Panels will stack through sticky scrolling and alternate graphite, black, blue, and image-led treatments. Every service retains its current title, description, media, and semantics.

### Skills

The existing eight skills remain data-driven. The section will combine a continuous horizontal skill band with a layered editorial grid. Skill icons, names, and descriptions remain accessible and visible without animation.

### Projetos

Existing project data and placeholder status remain unchanged. Each project becomes a wide immersive case-study panel with media, sequence number, category, title, description, technology icons, and current action. Panels overlap and assume focus sequentially during scroll.

### Processo

The six existing steps remain intact. A pinned stage will show one step at a time with an oversized number, current image, unchanged text, and synchronized progress indicator. Without animation, all steps render in normal document flow.

### FAQ

All existing questions and answers remain unchanged. The accordion will use large editorial rows, fine dividers, a rotating indicator, and measured height/opacity transitions. Current ARIA relationships and keyboard behavior remain intact.

### Contato

The existing contact heading, copy, WhatsApp action, and form remain. They will be composed as one monumental final editorial block: headline and WhatsApp action on one side, form on the other, collapsing to one column on mobile.

### Footer

The footer keeps its current content and links but uses an oversized RSoftware wordmark treatment, compact navigation, and a minimal closing rule.

## Motion System

### Preloader

- Display a visible percentage from 0 to 100.
- Reveal the RSoftware logo and wordmark through clipping masks.
- Exit with a vertical panel transition that exposes the hero.
- Avoid blocking the page indefinitely when media or scripts fail.

### Global Reveals

- Split presentation into line wrappers authored in markup or created without changing textual content.
- Reveal headings with vertical masks, short blur, and staggered timing.
- Reveal supporting elements only when they enter the viewport.
- Avoid animating hidden interactive controls into a focusable but invisible state.

### Hero Sequence

- Stagger headline lines on entry.
- Fade and translate the supporting copy and CTA after the title.
- Expand the video frame during the first scroll segment.
- Apply restrained media parallax and blue overlay movement.

### Service and Project Stacks

- Use sticky panels and scrubbed ScrollTrigger timelines.
- Incoming panels translate upward, scale toward one, and sharpen from a mild blur.
- Outgoing panels retain enough context to communicate stacking depth.
- Current content order remains the scroll and DOM order.

### Skills

- Run a slow, continuous horizontal band only while motion is allowed.
- Introduce the eight skill panels in staggered layers.
- Pause or simplify continuous motion when the tab is hidden or reduced motion is requested.

### Process Sequence

- Pin the process stage long enough to present all six steps.
- Crossfade the outgoing and incoming media and copy.
- Update the number and progress bar at the same timeline labels.
- Restore normal vertical flow on mobile configurations where pinning would reduce usability.

### Microinteractions

- Add magnetic movement only to pointer-accurate devices.
- Expand the custom cursor over links, buttons, and project panels.
- Keep FAQ, menu, buttons, links, and form controls fully functional without custom cursor support.

## Responsive Behavior

- Desktop receives the full editorial composition, sticky stacks, pinned sequences, cursor, and restrained parallax.
- Tablet retains the core stacking narratives with shorter pin durations and smaller transforms.
- Mobile preserves section order and visual hierarchy but reduces blur, parallax, and pinning to prevent trapped or excessively long scrolling.
- Typography scales with `clamp()` and avoids clipped words at 320 CSS pixels.
- Interactive targets remain at least 44 by 44 CSS pixels.
- Landscape phones use compact vertical spacing and unpinned fallbacks when viewport height is insufficient.

## Accessibility and Progressive Enhancement

- Semantic landmarks, heading order, labels, alternative text, and current ARIA relationships remain valid.
- Keyboard focus remains visible against every surface color.
- The mobile menu, FAQ, WhatsApp actions, and form remain operable by keyboard and touch.
- `prefers-reduced-motion: reduce` disables pinning, scrub, cursor effects, blur, parallax, continuous marquees, and long transitions.
- When GSAP or ScrollTrigger is unavailable, all panels and steps appear in ordinary flow with no hidden content.
- The local hero video remains muted, looping, inline, and nonessential to understanding the page.

## Code Architecture

- `index.html`: reorganize section markup for editorial wrappers and animation hooks without changing textual content or section order.
- `css/variables.css`: retain brand colors and extend spacing, typography, layering, and motion tokens.
- Existing section CSS modules: rewrite layouts and section-specific states while keeping concerns separated.
- `css/responsive.css`: centralize tablet, mobile, short-viewport, pointer, and reduced-motion overrides.
- `js/animations.js`: become the single GSAP orchestration entry point with isolated initializers for hero, services, skills, projects, process, and global reveals.
- `js/preloader.js`: own progress, reveal, timeout, and teardown behavior.
- `js/cursor.js`: own pointer-capability detection, cursor state, and magnetic controls.
- `js/main.js`: keep application initialization order and invoke progressive enhancements.
- Existing configuration, navigation, FAQ, form, skills, projects, process, and technology-icon modules remain the functional sources of truth.

Each animation initializer must validate its required elements and return silently when its section is absent. GSAP contexts and ScrollTriggers must be cleanly rebuilt after meaningful breakpoint changes.

## Failure Handling

- Preloader always releases the page after a bounded timeout.
- Failed video playback leaves a styled static frame rather than an empty hero.
- Failed remote card images retain readable gradients and text.
- Missing GSAP or ScrollTrigger activates a static fallback class before content can remain hidden.
- JavaScript errors in optional motion must not prevent navigation, FAQ, form, WhatsApp, skills, or projects from initializing.

## Verification

Because the repository intentionally has no test runner or package manifest, validation will use direct commands and targeted browser checks:

- Run `node --check` against every JavaScript module.
- Check internal file references and verify all local assets exist.
- Confirm heading order, landmarks, form labels, FAQ ARIA relationships, and reduced-motion rules.
- Serve the project root locally and require a successful HTTP response for `index.html`, CSS, JavaScript, logo, and hero video.
- Exercise navigation, mobile menu, FAQ, form validation, WhatsApp links, preloader release, project rendering, and skill rendering.
- Inspect representative desktop and mobile layouts for overflow, clipped text, hidden focus targets, and scroll traps.
- Run `git diff --check` before completion.
- Package the validated static root and publish a new version to the existing Sites project while preserving its current audience.

## Non-Goals

- Changing RSoftware copy, section order, business claims, contact details, or project data.
- Copying Componine's identity, source code, media, or proprietary content.
- Adding a framework, build pipeline, backend, CMS, analytics, authentication, or new third-party integrations.
- Replacing the RSoftware logo or changing the approved black-and-blue palette.
