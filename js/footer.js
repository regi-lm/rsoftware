function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getFooterWordmarkOrder(word) {
  const entrance = Array.from(word, (_, index) => index);
  return {
    entrance,
    exit: [...entrance].reverse(),
    accentIndex: 0
  };
}

export function renderFooterWordmark(container, word = "RSoftware") {
  if (!container) return;

  container.innerHTML = Array.from(word, (letter, index) =>
    `<span class="footer-wordmark__letter" data-footer-letter style="--letter-index:${index}" aria-hidden="true">${escapeHtml(letter)}</span>`
  ).join("");
}

export function initFooterWordmark(gsap, profile = "full") {
  const container = document.querySelector("[data-footer-wordmark]");
  if (!container) return () => {};

  const word = container.dataset.word || "RSoftware";
  renderFooterWordmark(container, word);
  if (!gsap || profile === "static") return () => {};

  const order = getFooterWordmarkOrder(word);
  const letters = Array.from(container.querySelectorAll("[data-footer-letter]"));
  const entrance = order.entrance.map((index) => letters[index]);
  const exit = order.exit.slice(0, -1).map((index) => letters[index]);
  const initial = letters[order.accentIndex];
  const hiddenState = {
    yPercent: -145,
    autoAlpha: 0,
    rotationX: -70,
    color: "#f5f7fa",
    textShadow: "none",
    filter: "blur(8px)"
  };

  gsap.set(letters, hiddenState);

  const timeline = gsap.timeline({
    repeat: -1,
    repeatDelay: .5
  });

  timeline
    .to(entrance, {
      yPercent: 0,
      autoAlpha: 1,
      rotationX: 0,
      filter: "blur(0px)",
      duration: .72,
      stagger: .11,
      ease: "back.out(1.35)"
    })
    .to({}, { duration: .9 })
    .to(exit, {
      yPercent: 90,
      autoAlpha: 0,
      rotationX: 55,
      filter: "blur(9px)",
      duration: .5,
      stagger: .08,
      ease: "power3.in"
    })
    .to(initial, {
      color: "#4cc9ff",
      textShadow: "0 0 34px rgba(76, 201, 255, .78)",
      duration: .32,
      ease: "power2.out"
    })
    .to({}, { duration: .18 })
    .to(initial, {
      yPercent: 90,
      autoAlpha: 0,
      rotationX: 55,
      filter: "blur(9px)",
      duration: .5,
      ease: "power3.in"
    })
    .to({}, { duration: .35 });

  return () => {
    timeline.kill();
    gsap.set(letters, { clearProps: "transform,opacity,visibility,color,textShadow,filter" });
  };
}
