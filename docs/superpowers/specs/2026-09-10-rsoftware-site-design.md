# RSoftware Site Design

## Goal

Build a complete static institutional site for RSoftware that demonstrates technical quality, generates quote requests, and encourages WhatsApp contact without inventing commercial facts.

## Scope

The site is a Vanilla HTML/CSS/JavaScript build prepared for static hosting. It includes a cinematic preloader, fixed responsive header, hero with a Three.js `</>` object, Sobre, Skills, Projetos, Processo, FAQ, Contato, footer, SEO metadata, accessibility basics, and documentation.

## Visual Direction

The design is 70% minimalist and 30% cinematic technology: matte black dominates, celestial blue is used only for light, CTAs, focus, and motion accents. Typography uses the system Apple-style stack. The supplied RSoftware logo remains the brand source and appears in the header, preloader, and footer.

## Behavior

The page progressively enhances from semantic HTML. If GSAP or Three.js fails, the content remains available and a 2D fallback remains visible. Desktop receives richer motion: preloader, cursor glow, pinned/horizontal projects, sticky process, and Three.js. Mobile receives lighter vertical layouts and disables hover/cursor effects. Reduced motion removes heavy scroll effects and long animated transitions.

## Data And Configuration

`dist/js/config.js` centralizes canonical URL, WhatsApp number, form endpoint, and social profile placeholders. The WhatsApp number starts empty, so WhatsApp CTAs do not navigate to a broken URL. `dist/js/projects.js` exposes data-driven project objects with explicit placeholder entries only.

## Constraints

No React, Vue, Angular, Next.js, Tailwind, Bootstrap, jQuery, backend, secrets, fake metrics, fake clients, fake prices, fixed delivery promises, invented phone numbers, or invented social links.

## Verification

Run JavaScript unit tests for data/config/form behavior, validate syntax, serve the static site locally, and do a smoke request to confirm the entrypoint is available.
