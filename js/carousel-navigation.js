export function getCarouselState({ scrollLeft, scrollWidth, clientWidth }, tolerance = 4) {
  const maximum = Math.max(scrollWidth - clientWidth, 0);
  if (maximum <= tolerance) return { showPrevious: false, showNext: false };

  const position = Math.min(Math.max(scrollLeft, 0), maximum);
  return {
    showPrevious: position > tolerance,
    showNext: position < maximum - tolerance
  };
}

export function getClosestCarouselIndex(track, items) {
  if (!items.length) return -1;
  const firstOffset = items[0].offsetLeft;
  return items.reduce((closest, item, index) => {
    const distance = Math.abs(item.offsetLeft - firstOffset - track.scrollLeft);
    return distance < closest.distance ? { index, distance } : closest;
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
}

export function initCarouselNavigation(options = {}) {
  const doc = options.doc ?? globalThis.document;
  const win = options.win ?? globalThis.window;
  if (!doc || !win) return () => {};

  const requestFrame = options.requestFrame ?? win.requestAnimationFrame?.bind(win);
  const cancelFrame = options.cancelFrame ?? win.cancelAnimationFrame?.bind(win);
  const reducedMotion = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const cleanups = [];

  doc.querySelectorAll("[data-carousel-controls]").forEach((controls) => {
    const track = doc.getElementById(controls.getAttribute("aria-controls"));
    const previous = controls.querySelector("[data-carousel-previous]");
    const next = controls.querySelector("[data-carousel-next]");
    const items = track ? [...track.children] : [];
    if (!track || !previous || !next || !items.length) return;

    let frameId = 0;
    const update = () => {
      const state = getCarouselState(track);
      controls.hidden = items.length < 2;
      previous.hidden = !state.showPrevious;
      previous.disabled = !state.showPrevious;
      next.hidden = !state.showNext;
      next.disabled = !state.showNext;
    };
    const scheduleUpdate = () => {
      if (!requestFrame) {
        update();
        return;
      }
      if (frameId) return;
      frameId = requestFrame(() => {
        frameId = 0;
        update();
      });
    };
    const move = (direction) => {
      const current = getClosestCarouselIndex(track, items);
      const targetIndex = Math.min(Math.max(current + direction, 0), items.length - 1);
      const left = items[targetIndex].offsetLeft - items[0].offsetLeft;
      const behavior = reducedMotion?.matches ? "auto" : "smooth";
      if (typeof track.scrollTo === "function") track.scrollTo({ left, behavior });
      else track.scrollLeft = left;
      scheduleUpdate();
    };
    const movePrevious = () => move(-1);
    const moveNext = () => move(1);

    previous.addEventListener("click", movePrevious);
    next.addEventListener("click", moveNext);
    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    win.addEventListener("resize", scheduleUpdate, { passive: true });
    update();

    cleanups.push(() => {
      previous.removeEventListener("click", movePrevious);
      next.removeEventListener("click", moveNext);
      track.removeEventListener("scroll", scheduleUpdate);
      win.removeEventListener("resize", scheduleUpdate);
      if (frameId && cancelFrame) cancelFrame(frameId);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
