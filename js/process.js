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

  if ("IntersectionObserver" in window) {
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      if (document.body.classList.contains("motion-full")) return;
      entries.forEach((entry) => visible.set(entry.target, entry.intersectionRatio));
      let active = 0;
      let bestRatio = -1;
      steps.forEach((step, index) => {
        const ratio = visible.get(step) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          active = index;
        }
      });
      setProcessProgress(active, steps.length, progress);
    }, {
      rootMargin: "-28% 0px -42% 0px",
      threshold: [0, 0.2, 0.5, 0.8, 1]
    });

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }

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
