# RSoftware Global Matrix Background — Design

## Objective

Add a global, fixed Canvas 2D background that renders a restrained blue binary rain behind the entire RSoftware site. The effect must remain visible throughout scrolling without reducing content legibility, intercepting interaction, changing layout, or weakening existing responsive and accessibility behavior.

## Existing Architecture

The site is static HTML, CSS, and JavaScript modules. `index.html` contains a single `main` followed by the footer. `js/main.js` owns feature initialization and cleanup around the existing preloader. GSAP and ScrollTrigger own content animation, while the cursor and preloader run independent `requestAnimationFrame` loops.

The current layer system is:

- Preloader: `z-index: 9999`.
- Global noise overlay (`body::after`): `z-index: 1000`, non-interactive.
- Cursor: `z-index: 120`, non-interactive.
- Header: `z-index: 80`.
- Floating WhatsApp control: `z-index: 3`.
- Hero copy and section-local content: local stacking contexts.
- Decorative global gradient (`body::before`): `z-index: -1`.
- Solid root/body background: `var(--bg)`.

Because the root and body currently paint an opaque background, placing the Canvas at a negative z-index would hide it. The Canvas must instead occupy the first positive global layer, with normal page content explicitly above it.

## Chosen Approach

Use one fixed Canvas 2D element and a dedicated JavaScript module. This approach provides the required procedural variation and performance without adding many DOM nodes or the compatibility and lifecycle complexity of `OffscreenCanvas` and workers.

Rejected alternatives:

- `OffscreenCanvas`/Web Worker: unnecessary complexity for the moderate particle count and weaker compatibility.
- HTML/CSS character columns: excessive DOM activity and less predictable performance.

## Files and Integration

Add:

- `css/matrix-background.css`
- `js/matrix-background.js`
- Unit tests for pure simulation and lifecycle behavior.

Update:

- `index.html` to add `<canvas id="matrix-background" aria-hidden="true"></canvas>` immediately after the opening body content boundary and to load the new stylesheet.
- `js/main.js` to initialize the effect after the preloader and dispose it on `pagehide`.
- Only the minimum global layer declarations needed to keep the Canvas visible behind content.

No existing content, section, image, animation, integration, form, or navigation behavior will be removed.

## Layer Model

The intended global order is:

1. Root/body dark background.
2. Matrix Canvas at `z-index: 0`.
3. Existing decorative gradient above the Canvas as a legibility veil.
4. `main`, footer, header, floating controls, and normal content at positive z-index values.
5. Existing cursor and noise overlay.
6. Existing preloader and skip link.

The Canvas will use `position: fixed`, `inset: 0`, `width: 100vw`, `height: 100vh`, `pointer-events: none`, and no focusable semantics. It will not participate in document flow and therefore cannot create horizontal or vertical scroll.

Sections remain transparent where they already are. Cards, project panels, process panels, media overlays, forms, and navigation retain their existing opaque or translucent surfaces. The current global gradient remains unchanged and moves from its negative layer to the layer between the Matrix and the content.

## Simulation Model

The renderer uses three depth profiles within one Canvas:

### Background layer

- Small glyphs.
- Low density, opacity, and glow.
- Slow fall speed.
- Longer, softer trails.

### Middle layer

- Primary density.
- Medium glyphs using `#1E90FF` and nearby palette colors.
- Moderate speed and subtle glow.
- Medium-length trails.

### Foreground layer

- Sparse columns.
- Slightly larger glyphs.
- Faster movement and brighter blue.
- More visible, but still restrained, glow.

Each column stores its layer, x-coordinate, head position, fall speed, trail length, opacity, brightness, respawn delay, and glyph sequence state. Columns do not share start time, speed, trail length, opacity, or reset interval. A seeded or injected random source will make the generation logic testable while production remains organic.

Each trail is drawn from head to tail with decreasing alpha. Most glyphs are `0` and `1`. A controlled subset of heads uses `#E0F7FF` or white with a soft blue shadow. The renderer draws full trails directly each frame instead of creating persistent DOM elements.

## Animation and Input

The main loop uses `requestAnimationFrame` with bounded delta time so long frames or tab restoration cannot cause large jumps. Exactly one active frame handle is owned by the module.

Pointer interaction is enabled only for precise pointers and only when reduced motion is not requested. The module stores the latest pointer position through one passive listener. Columns close to a small influence radius receive a bounded brightness and speed multiplier; no repulsion or large position changes occur.

Scroll interaction uses one passive listener that measures recent scroll delta. It updates a target multiplier rather than directly changing every column. The animation frame interpolates current speed and brightness toward their targets. Fast scrolling can raise speed to a maximum multiplier of `1.22` and brightness to `1.12`; both return smoothly to baseline when scrolling stops.

When the document becomes hidden, the loop pauses. It resumes from a fresh timestamp when visible, preventing a large delta. Cleanup cancels the frame and removes pointer, scroll, resize, visibility, and media-query listeners.

## Responsive and HiDPI Behavior

Canvas backing dimensions are based on viewport dimensions and a capped DPR:

- Desktop and capable devices: maximum DPR of 2.
- Smaller or coarse-pointer devices: lower density, smaller column count, lower glow, and a reduced DPR cap.

The CSS dimensions remain viewport-sized while the backing store is scaled for sharp glyphs. Resize work is coalesced through one animation-frame callback, then the Canvas and column population are rebuilt for the new viewport.

Mobile disables pointer influence. Column spacing and profile density scale with viewport width so narrow screens render materially fewer glyphs.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active, the module creates a nearly static composition and does not start a continuous animation loop. The static frame is regenerated only when the viewport changes or when the preference changes. Pointer and scroll reactions remain disabled.

The module listens for preference changes so switching modes does not create duplicate loops or listeners.

## Failure Handling

If the Canvas element or its 2D context is unavailable, initialization returns a no-op disposer and the current dark site background remains intact. Feature initialization runs through the existing `safelyInitialize` boundary, so a renderer error cannot prevent navigation, forms, the cursor, or GSAP initialization.

External libraries are not required. The Matrix renderer remains independent of GSAP and ScrollTrigger.

## Testing and Verification

Automated tests will cover observable simulation and lifecycle contracts:

- Three depth profiles are produced with ordered differences in size, speed, opacity, density, and glow.
- Generated columns remain within configured ranges while varying independently.
- Desktop and mobile profiles enforce their density and DPR limits.
- Scroll boost is bounded and interpolates back toward baseline.
- Reduced-motion mode produces a static frame without scheduling a continuous loop.
- Initialization owns one frame loop and cleanup cancels it and removes registered listeners.
- Resize updates backing dimensions and rebuilds the population without accumulating scheduled work.

Final verification will include:

- Full automated test suite and JavaScript syntax checks.
- Diff validation and inspection of the layer model.
- Desktop and mobile viewport checks where the environment permits rendering.
- Interaction checks for links, buttons, form fields, navigation, and scrolling.
- Confirmation that the Canvas remains viewport-fixed throughout the document.
- Console inspection for runtime errors.
- Confirmation that no duplicate animation loops or listeners are created after resize, visibility changes, or motion-preference changes.

## Success Criteria

The implementation is complete when the binary rain remains visible but secondary to content across all sections, stays fixed during scroll, adapts to desktop and mobile, respects reduced motion, survives resize, does not intercept interaction or create overflow, and introduces no regressions to existing content or behavior.
