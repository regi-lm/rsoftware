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

export function renderProjects(container, list = projects) {
  if (!container) return;

  container.innerHTML = list.map((project, index) => `
    <article class="project-panel" data-project${project.image ? ` style="background-image: url('${project.image}')"` : ""}>
      <div class="project-panel__content">
        <p class="eyebrow">Projeto ${String(index + 1).padStart(2, "0")} / ${project.category}</p>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <ul class="tech-list" aria-label="Tecnologias">
          ${project.technologies.map((tech) => `<li>${tech}</li>`).join("")}
        </ul>
        ${project.url ? `<a class="text-link" href="${project.url}" target="_blank" rel="noreferrer">Ver projeto</a>` : `<span class="placeholder-note">Placeholder configurável</span>`}
      </div>
    </article>
  `).join("");
}
