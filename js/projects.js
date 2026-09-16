import { getTechnologyIcon } from "./technology-icons.js";

const fallbackProjectImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=76";

export const projects = [
  {
    id: "placeholder-website",
    title: "Placeholder - Site institucional",
    category: "Site",
    description: "Espaço reservado para um projeto real da RSoftware, com capa, objetivo, stack e link configuráveis.",
    image: "",
    technologies: ["HTML", "CSS", "JavaScript"],
    url: null,
    placeholder: true
  },
  {
    id: "placeholder-system",
    title: "Placeholder - Sistema web",
    category: "Sistema",
    description: "Modelo visual para demonstrar como projetos futuros serão apresentados sem inventar clientes ou resultados.",
    image: "",
    technologies: ["React", "Node.js", "Supabase"],
    url: null,
    placeholder: true
  },
  {
    id: "placeholder-landing",
    title: "Placeholder - Landing page",
    category: "Landing Page",
    description: "Entrada neutra para uma experiência orientada a conversão, pronta para receber dados reais depois.",
    image: "",
    technologies: ["HTML", "CSS", "GSAP"],
    url: null,
    placeholder: true
  }
];

function formatBrandName(text) {
  return text.replaceAll(
    "RSoftware",
    '<span class="brand-word"><span class="brand-initial">R</span>Software</span>'
  );
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderProjects(container, list = projects) {
  if (!container) return;

  container.innerHTML = list.map((project, index) => `
    <article class="project-panel" data-project data-project-panel style="--i:${index}">
      <img class="project-panel__media" src="${project.image || fallbackProjectImage}" alt="" loading="lazy" width="1600" height="1067">
      <div class="project-panel__overlay" aria-hidden="true"></div>
      <span class="project-panel__index">${String(index + 1).padStart(2, "0")}</span>
      <div class="project-panel__content" data-project-content>
        <p class="eyebrow">${project.category}</p>
        <h3>${project.title}</h3>
        <p>${formatBrandName(project.description)}</p>
        <ul class="tech-list" aria-label="Tecnologias">
          ${project.technologies.map((tech) => {
            const icon = getTechnologyIcon(tech);
            const iconName = escapeHtmlAttribute(icon.name);
            return `<li class="tech-icon" title="${iconName}"><img src="${icon.src}" alt="${iconName}" width="28" height="28" loading="lazy"></li>`;
          }).join("")}
        </ul>
        ${project.url ? `<a class="button button--ghost project-panel__action" href="${project.url}" target="_blank" rel="noreferrer">Ver projeto</a>` : `<span class="placeholder-note">Placeholder configurável</span>`}
      </div>
    </article>
  `).join("");
}
