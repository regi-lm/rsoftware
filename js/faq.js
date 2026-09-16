export function getFaqAnimationFrames(open, height) {
  return open
    ? [{ height: "0px", opacity: 0 }, { height: `${height}px`, opacity: 1 }]
    : [{ height: `${height}px`, opacity: 1 }, { height: "0px", opacity: 0 }];
}

export function initFaq() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new WeakMap();

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;

      const willOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(willOpen));
      animations.get(panel)?.cancel();

      if (reduced || typeof panel.animate !== "function") {
        panel.hidden = !willOpen;
        return;
      }

      panel.hidden = false;
      const height = panel.scrollHeight;
      const animation = panel.animate(getFaqAnimationFrames(willOpen, height), {
        duration: 360,
        easing: "cubic-bezier(.22,1,.36,1)"
      });
      animations.set(panel, animation);

      animation.onfinish = () => {
        panel.hidden = !willOpen;
        panel.style.height = "";
        panel.style.opacity = "";
        animations.delete(panel);
      };
    });
  });
}
