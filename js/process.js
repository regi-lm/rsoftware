export function initProcessProgress() {
  const steps = [...document.querySelectorAll("[data-process-step]")];
  const progress = document.querySelector("[data-process-progress]");
  if (!steps.length || !progress) return;

  const update = () => {
    const viewportMid = innerHeight * 0.55;
    let active = 0;
    steps.forEach((step, index) => {
      if (step.getBoundingClientRect().top < viewportMid) active = index;
    });
    progress.style.transform = `scaleY(${(active + 1) / steps.length})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}
