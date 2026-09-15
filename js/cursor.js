export function initCursor() {
  const canUse = matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUse) return;

  const cursor = document.querySelector("[data-cursor-glow]");
  if (!cursor) return;

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let tx = x;
  let ty = y;

  window.addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
  }, { passive: true });

  document.querySelectorAll("a, button, input, textarea, select, [data-cursor]").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.dataset.state = element.dataset.cursor || "link");
    element.addEventListener("pointerleave", () => cursor.dataset.state = "default");
  });

  const tick = () => {
    x += (tx - x) * 0.16;
    y += (ty - y) * 0.16;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(tick);
  };

  tick();
}
