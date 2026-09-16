export function getMotionProfile({ width, height, reduced, pointerFine }) {
  if (reduced) return "static";
  if (width < 760 || height < 620 || !pointerFine) return "compact";
  return "full";
}

export function initAnimations() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const profile = getMotionProfile({
    width: innerWidth,
    height: innerHeight,
    reduced,
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

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, {
      y: 42,
      opacity: 0,
      filter: "blur(12px)",
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%"
      }
    });
  });

  const skillItems = gsap.utils.toArray(".skill-item");
  if (skillItems.length >= 8 && matchMedia("(min-width: 981px)").matches) {
    const lowerSkills = skillItems.slice(4);
    gsap.fromTo(lowerSkills,
      { y: 120, scale: 0.96, opacity: 0.72 },
      {
        y: -92,
        scale: 1,
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".skills__grid",
          start: "top 68%",
          end: "bottom 36%",
          scrub: 0.9
        }
      }
    );
  }

  const serviceCards = gsap.utils.toArray("[data-service-card]");
  if (serviceCards.length && matchMedia("(min-width: 981px)").matches) {
    serviceCards.forEach((card, index) => {
      gsap.fromTo(card,
        { y: index === 0 ? 0 : 90, scale: index === 0 ? 1 : 0.96, opacity: index === 0 ? 1 : 0.7 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            end: "top 24%",
            scrub: 0.8
          }
        }
      );
    });
  }

  const steps = gsap.utils.toArray("[data-process-step]");
  if (steps.length && matchMedia("(min-width: 820px)").matches) {
    steps.forEach((step, index) => {
      gsap.fromTo(step,
        { opacity: index === 0 ? 1 : 0.18, y: index === 0 ? 0 : 24 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: step,
            start: "top 72%",
            end: "bottom 38%",
            scrub: true
          }
        }
      );
    });
  }

  ScrollTrigger.refresh();
  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
}
