import { CONFIG, getWhatsAppHref } from "./config.js";
import { initContactForm } from "./form.js";
import { renderProjects } from "./projects.js";
import { renderSkills, renderTechnologyMarquee } from "./skills.js";
import { initNavigation } from "./navigation.js";
import { initFaq } from "./faq.js";
import { initCursor } from "./cursor.js";
import { initPreloader } from "./preloader.js";
import { initAnimations } from "./animations.js";
import { initProcessProgress } from "./process.js";
import { initMatrixBackground } from "./matrix-background.js";
import { initCarouselNavigation } from "./carousel-navigation.js";

document.documentElement.classList.add("has-js");

function safelyInitialize(initializer) {
  try {
    return initializer();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function initWhatsApp() {
  const href = getWhatsAppHref();
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    if (!href) {
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", "Configure WHATSAPP_NUMBER em js/config.js");
      link.addEventListener("click", (event) => event.preventDefault());
      return;
    }
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
  });
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

renderTechnologyMarquee(document.querySelector("[data-hero-technologies]"));
renderSkills(document.querySelector("[data-skills-grid]"));
renderProjects(document.querySelector("[data-project-track]"));
safelyInitialize(initNavigation);
safelyInitialize(initFaq);
safelyInitialize(initWhatsApp);
safelyInitialize(() => initContactForm(document.querySelector("[data-contact-form]"), CONFIG));
safelyInitialize(initProcessProgress);
const disposeCarouselNavigation = safelyInitialize(initCarouselNavigation) ?? (() => {});
safelyInitialize(initIcons);

const preloaderPromise = safelyInitialize(initPreloader) ?? Promise.resolve();
Promise.resolve(preloaderPromise).finally(() => {
  const disposeMatrix = safelyInitialize(initMatrixBackground) ?? (() => {});
  safelyInitialize(initCursor);

  let disposeAnimations = safelyInitialize(initAnimations) ?? (() => {});
  const motionQueries = [
    matchMedia("(max-width: 759px)"),
    matchMedia("(max-height: 619px)"),
    matchMedia("(pointer: fine)"),
    matchMedia("(prefers-reduced-motion: reduce)")
  ];
  const rebuildAnimations = () => {
    disposeAnimations();
    disposeAnimations = safelyInitialize(initAnimations) ?? (() => {});
  };

  motionQueries.forEach((query) => query.addEventListener("change", rebuildAnimations));
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    motionQueries.forEach((query) => query.removeEventListener("change", rebuildAnimations));
    disposeCarouselNavigation();
    disposeMatrix();
    disposeAnimations();
  });
});
