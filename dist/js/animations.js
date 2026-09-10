export function initAnimations() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ScrollTrigger || reduced) {
    document.body.classList.add("motion-light");
    return;
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

  const track = document.querySelector("[data-project-track]");
  const section = document.querySelector("[data-project-section]");
  if (track && section && matchMedia("(min-width: 900px)").matches) {
    const getDistance = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 0.8,
        end: () => `+=${getDistance() + innerWidth * 0.35}`,
        invalidateOnRefresh: true
      }
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
}
