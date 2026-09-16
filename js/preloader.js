export function getPreloaderProgress(elapsedMs, durationMs) {
  if (durationMs <= 0) return 1;
  return Math.min(Math.max(elapsedMs / durationMs, 0), 1);
}

export function initPreloader({ timeoutMs = 2400 } = {}) {
  const preloader = document.querySelector("[data-preloader]");
  if (!preloader) {
    document.body.classList.add("site-ready");
    return Promise.resolve();
  }

  const bar = preloader.querySelector("[data-progress-bar]");
  const label = preloader.querySelector("[data-progress-label]");
  let shortVisit = false;
  try {
    shortVisit = sessionStorage.getItem("rsoftware-preloaded") === "true";
  } catch {}
  const targetDuration = shortVisit ? 420 : 1100;
  const start = performance.now();

  return new Promise((resolve) => {
    let completed = false;
    let frameId = 0;
    let removeId = 0;

    const release = ({ immediate = false } = {}) => {
      if (completed) return;
      completed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(deadlineId);

      try {
        sessionStorage.setItem("rsoftware-preloaded", "true");
      } catch {}

      preloader.setAttribute("aria-hidden", "true");
      preloader.classList.add("is-complete");

      const remove = () => {
        clearTimeout(removeId);
        preloader.remove();
        document.body.classList.add("site-ready");
        resolve();
      };

      if (immediate) remove();
      else removeId = setTimeout(remove, 680);
    };

    const deadlineId = setTimeout(() => release({ immediate: true }), timeoutMs);

    const update = (now) => {
      const progress = getPreloaderProgress(now - start, targetDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const percent = Math.round(eased * 100);
      if (bar) bar.style.transform = `scaleX(${eased})`;
      if (label) label.textContent = `${percent}%`;

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
        return;
      }

      release();
    };

    frameId = requestAnimationFrame(update);
  });
}
