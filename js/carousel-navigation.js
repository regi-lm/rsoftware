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

export function getCarouselIndexState(index, itemCount) {
  if (itemCount <= 1 || index < 0) return { showPrevious: false, showNext: false };
  return {
    showPrevious: index > 0,
    showNext: index < itemCount - 1
  };
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
    let settleId = 0;
    let activeIndex = getClosestCarouselIndex(track, items);
    const setArrowVisible = (button, visible) => {
      button.classList.toggle("is-hidden", !visible);
      button.disabled = !visible;
      button.setAttribute("aria-hidden", String(!visible));
    };
    const update = (index = getClosestCarouselIndex(track, items)) => {
      activeIndex = index;
      const state = getCarouselIndexState(activeIndex, items.length);
      controls.hidden = items.length < 2;
      setArrowVisible(previous, state.showPrevious);
      setArrowVisible(next, state.showNext);
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
    const scheduleSettledUpdate = () => {
      win.clearTimeout(settleId);
      settleId = win.setTimeout(() => {
        settleId = 0;
        scheduleUpdate();
      }, 140);
    };
    const finishScroll = () => {
      win.clearTimeout(settleId);
      settleId = 0;
      scheduleUpdate();
    };
    const move = (direction) => {
      const targetIndex = Math.min(Math.max(activeIndex + direction, 0), items.length - 1);
      const left = items[targetIndex].offsetLeft - items[0].offsetLeft;
      const behavior = reducedMotion?.matches ? "auto" : "smooth";
      update(targetIndex);
      if (typeof track.scrollTo === "function") track.scrollTo({ left, behavior });
      else track.scrollLeft = left;
      scheduleSettledUpdate();
    };
    const movePrevious = () => move(-1);
    const moveNext = () => move(1);

    previous.addEventListener("click", movePrevious);
    next.addEventListener("click", moveNext);
    track.addEventListener("scroll", scheduleSettledUpdate, { passive: true });
    track.addEventListener("scrollend", finishScroll);
    win.addEventListener("resize", scheduleUpdate, { passive: true });
    update();

    cleanups.push(() => {
      previous.removeEventListener("click", movePrevious);
      next.removeEventListener("click", moveNext);
      track.removeEventListener("scroll", scheduleSettledUpdate);
      track.removeEventListener("scrollend", finishScroll);
      win.removeEventListener("resize", scheduleUpdate);
      win.clearTimeout(settleId);
      if (frameId && cancelFrame) cancelFrame(frameId);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
