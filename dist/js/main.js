import { CONFIG, getWhatsAppHref } from "./config.js";
import { initContactForm } from "./form.js";
import { renderProjects } from "./projects.js";
import { renderSkills } from "./skills.js";
import { initNavigation } from "./navigation.js";
import { initFaq } from "./faq.js";
import { initCursor } from "./cursor.js";
import { initPreloader } from "./preloader.js";
import { initHeroThree } from "./hero-three.js";
import { initAnimations } from "./animations.js";
import { initProcessProgress } from "./process.js";

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

renderSkills(document.querySelector("[data-skills-grid]"));
renderProjects(document.querySelector("[data-project-track]"));
initNavigation();
initFaq();
initCursor();
initWhatsApp();
initContactForm(document.querySelector("[data-contact-form]"), CONFIG);
initProcessProgress();
initIcons();

initPreloader().then(() => {
  initHeroThree();
  initAnimations();
});
