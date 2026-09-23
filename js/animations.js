import { setProcessProgress } from "./process.js";
import { initFooterWordmark } from "./footer.js";

export function getMotionProfile({ width, height, reduced, pointerFine }) {
  if (reduced) return "static";
  if (width < 760 || height < 620 || !pointerFine) return "compact";
  return "full";
}

export function getPanelScrollDistance(count, viewportHeight, profile) {
  if (profile === "static" || count <= 1) return 0;
  const factor = profile === "compact" ? 0.55 : 1;
  return Math.round((count - 1) * viewportHeight * factor);
}

function initGlobalReveals(gsap, profile) {
  const distance = profile === "compact" ? 22 : 52;

  gsap.utils.toArray("[data-reveal], [data-reveal-line]").forEach((element) => {
    if (element.closest("[data-hero-copy]")) return;

    gsap.from(element, {
      y: distance,
      opacity: 0,
      filter: profile === "full" ? "blur(12px)" : "blur(5px)",
      duration: profile === "full" ? 1.05 : 0.72,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        once: true
      }
    });
  });
}

function initHeroSequence(gsap, profile) {
  const titleLines = gsap.utils.toArray("[data-title-line]");
  const heroCopy = document.querySelector("[data-hero-copy]");
  if (!heroCopy || !titleLines.length) return;

  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro
    .from(titleLines, {
      yPercent: 112,
      rotation: profile === "full" ? 1.5 : 0,
      opacity: 0,
      duration: profile === "full" ? 1.15 : 0.78,
      stagger: 0.08
    })
    .from(heroCopy.querySelectorAll(":scope > p, .cta-row, .hero__technologies"), {
      y: 24,
      opacity: 0,
      duration: 0.72,
      stagger: 0.08
    }, "-=0.5");
}

function initPanelStack(gsap, selector, profile) {
  const panels = gsap.utils.toArray(selector);
  if (panels.length < 2) return;

  panels.slice(1).forEach((panel) => {
    gsap.fromTo(panel,
      {
        y: profile === "full" ? 96 : 48,
        scale: profile === "full" ? 0.94 : 0.98,
        opacity: 0.72,
        filter: profile === "full" ? "blur(12px)" : "blur(4px)"
      },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: profile === "full" ? "top 88%" : "top 92%",
          end: profile === "full" ? "top 24%" : "top 58%",
          scrub: profile === "full" ? 0.9 : 0.45
        }
      }
    );
  });
}

function initSkillsSequence(gsap, profile) {
  const marquee = document.querySelector("[data-skill-marquee]");
  const items = gsap.utils.toArray("[data-skill-motion]");
  let marqueeTween;

  if (marquee) {
    marqueeTween = gsap.to(marquee, {
      xPercent: -50,
      duration: profile === "full" ? 24 : 34,
      repeat: -1,
      ease: "none"
    });
  }

  if (items.length) {
    gsap.from(items, {
      y: profile === "full" ? 86 : 38,
      rotationZ: (index) => profile === "full" ? (index % 2 ? 1.2 : -1.2) : 0,
      opacity: 0,
      filter: profile === "full" ? "blur(10px)" : "blur(4px)",
      duration: 0.9,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-skills-stage]",
        start: "top 82%",
        once: true
      }
    });
  }

  const syncMarquee = () => marqueeTween?.paused(document.hidden);
  document.addEventListener("visibilitychange", syncMarquee);
  return () => document.removeEventListener("visibilitychange", syncMarquee);
}

function initProcessSequence(gsap, profile) {
  const stage = document.querySelector("[data-process-stage]");
  const steps = gsap.utils.toArray("[data-process-step]");
  if (!stage || steps.length < 2 || profile !== "full") return;

  gsap.set(steps, { autoAlpha: 0, y: 34, scale: 0.96, filter: "blur(12px)" });
  gsap.set(steps[0], { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)" });
  setProcessProgress(0, steps.length);

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top+=90",
      end: () => `+=${getPanelScrollDistance(steps.length, innerHeight, profile)}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const active = Math.round(self.progress * (steps.length - 1));
        setProcessProgress(active, steps.length);
      }
    }
  });

  for (let index = 1; index < steps.length; index += 1) {
    const position = index - 1;
    timeline
      .to(steps[index - 1], {
        autoAlpha: 0,
        y: -34,
        scale: 0.94,
        filter: "blur(12px)",
        duration: 0.48
      }, position)
      .fromTo(steps[index], {
        autoAlpha: 0,
        y: 34,
        scale: 0.96,
        filter: "blur(12px)"
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.52
      }, position + 0.48);
  }
}

export function initAnimations() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const profile = getMotionProfile({
    width: innerWidth,
    height: innerHeight,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    pointerFine: matchMedia("(pointer: fine)").matches
  });

  document.body.classList.remove("motion-static", "motion-compact", "motion-full");
  document.body.classList.add(`motion-${profile}`);

  if (!gsap || !ScrollTrigger || profile === "static") {
    document.body.classList.remove("motion-compact", "motion-full");
    document.body.classList.add("motion-static");
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);
  const disposeFooter = initFooterWordmark(gsap, profile);
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add("(min-width: 1px)", () => {
      initGlobalReveals(gsap, profile);
      initHeroSequence(gsap, profile);
      initPanelStack(gsap, "[data-service-card]", profile);
      const disposeSkills = initSkillsSequence(gsap, profile);
      return () => disposeSkills?.();
    });
    media.add("(max-width: 980px)", () => {
      initPanelStack(gsap, "[data-process-step]", profile);
    });
    media.add("(min-width: 981px)", () => {
      initPanelStack(gsap, "[data-project-panel]", profile);
      initProcessSequence(gsap, profile);
    });
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    disposeFooter?.();
    media.revert();
    context.revert();
  };
}
