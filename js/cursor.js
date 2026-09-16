export function getMagneticOffset(pointerX, pointerY, rect, strength = 0.2) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    x: Math.round((pointerX - centerX) * strength * 100) / 100,
    y: Math.round((pointerY - centerY) * strength * 100) / 100
  };
}

export function initCursor() {
  const canUse = matchMedia("(pointer: fine)").matches
    && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUse) return () => {};

  const cursor = document.querySelector("[data-cursor-glow]");
  if (!cursor) return () => {};

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let targetX = x;
  let targetY = y;
  let frameId = 0;
  let running = true;

  const onPointerMove = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    document.body.classList.add("cursor-active");
  };

  const interactive = [...document.querySelectorAll("a, button, input, textarea, select, [data-cursor]")];
  const stateListeners = interactive.map((element) => {
    const enter = () => { cursor.dataset.state = element.dataset.cursor || "link"; };
    const leave = () => { cursor.dataset.state = "default"; };
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    return { element, enter, leave };
  });

  const magnetic = [...document.querySelectorAll("[data-magnetic], [data-cursor='cta']")];
  const magneticListeners = magnetic.map((element) => {
    const move = (event) => {
      const offset = getMagneticOffset(event.clientX, event.clientY, element.getBoundingClientRect());
      element.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
    };
    const leave = () => { element.style.transform = ""; };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    return { element, move, leave };
  });

  const tick = () => {
    if (!running) return;
    x += (targetX - x) * 0.17;
    y += (targetY - y) * 0.17;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    frameId = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pagehide", stop, { once: true });
  frameId = requestAnimationFrame(tick);

  return () => {
    stop();
    window.removeEventListener("pointermove", onPointerMove);
    stateListeners.forEach(({ element, enter, leave }) => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
    });
    magneticListeners.forEach(({ element, move, leave }) => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      element.style.transform = "";
    });
  };
}
