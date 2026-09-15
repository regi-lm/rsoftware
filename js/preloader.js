export function initPreloader() {
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader) return Promise.resolve();

  const bar = preloader.querySelector("[data-progress-bar]");
  const label = preloader.querySelector("[data-progress-label]");
  const shortVisit = sessionStorage.getItem("rsoftware-preloaded") === "true";
  const targetDuration = shortVisit ? 420 : 1100;
  const start = performance.now();

  return new Promise((resolve) => {
    const update = (now) => {
      const progress = Math.min((now - start) / targetDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const percent = Math.round(eased * 100);
      bar.style.transform = `scaleX(${eased})`;
      label.textContent = `${percent}%`;

      if (progress < 1) {
        requestAnimationFrame(update);
        return;
      }

      sessionStorage.setItem("rsoftware-preloaded", "true");
      preloader.classList.add("is-complete");
      setTimeout(() => {
        preloader.remove();
        document.body.classList.add("site-ready");
        resolve();
      }, 520);
    };

    requestAnimationFrame(update);
  });
}
