export function setProcessProgress(
  activeIndex,
  count,
  progressElement = document.querySelector("[data-process-progress]")
) {
  if (!progressElement || count <= 0) return;
  const bounded = Math.min(Math.max(activeIndex, 0), count - 1);
  progressElement.style.transform = `scaleY(${(bounded + 1) / count})`;
}

export function initProcessProgress() {
  const steps = [...document.querySelectorAll("[data-process-step]")];
  const progress = document.querySelector("[data-process-progress]");
  if (!steps.length || !progress) return () => {};

  const update = () => {
    if (document.body.classList.contains("motion-full")) return;
    const viewportMid = innerHeight * 0.55;
    let active = 0;
    steps.forEach((step, index) => {
      if (step.getBoundingClientRect().top < viewportMid) active = index;
    });
    setProcessProgress(active, steps.length, progress);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update);
}
