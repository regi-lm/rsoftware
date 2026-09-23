export const skills = [
  {
    name: "HTML",
    iconSlug: "html5",
    accent: "#e34f26",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    copy: "Estrutura semântica e acessível para construir experiências sólidas desde a base.",
    use: "Base de páginas rápidas, SEO e acessibilidade."
  },
  {
    name: "CSS",
    iconSlug: "css",
    accent: "#1572b6",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    copy: "Responsividade, identidade visual e sistemas de interface que funcionam em qualquer tela.",
    use: "Design systems, layouts fluidos e microinterações."
  },
  {
    name: "JavaScript",
    iconSlug: "javascript",
    accent: "#f7df1e",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    copy: "Interações, comportamento e experiências dinâmicas diretamente no navegador.",
    use: "Fluxos interativos, validação e integrações."
  },
  {
    name: "React",
    iconSlug: "react",
    accent: "#61dafb",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    copy: "Interfaces modernas e escaláveis para aplicações que exigem componentes e estados complexos.",
    use: "Produtos com dashboards, estados ricos e evolução contínua."
  },
  {
    name: "Node.js",
    iconSlug: "nodedotjs",
    accent: "#339933",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    copy: "APIs, integrações e lógica de servidor para conectar produtos, dados e serviços.",
    use: "Backends, automações e integrações externas."
  },
  {
    name: "Supabase",
    iconSlug: "supabase",
    accent: "#3fcf8e",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
    copy: "Banco de dados, autenticação e infraestrutura para produtos digitais que precisam evoluir rapidamente.",
    use: "MVPs com dados, login e crescimento gradual."
  },
  {
    name: "Git",
    iconSlug: "git",
    accent: "#f05032",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    copy: "Versionamento e controle do desenvolvimento para manter cada evolução do projeto organizada e segura.",
    use: "Histórico, colaboração e entregas controladas."
  },
  {
    name: "Vercel",
    iconSlug: "vercel",
    accent: "#ffffff",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
    copy: "Deploy, preview e publicação de interfaces web com fluxo rápido, confiável e preparado para produção.",
    use: "Hospedagem, previews e entrega contínua."
  }
];

export function renderTechnologyMarquee(container, list = skills) {
  if (!container) return;

  const renderSet = (duplicate = false) => list.map((skill) => `
    <span class="hero__technology" ${duplicate ? 'aria-hidden="true"' : `role="img" aria-label="${skill.name}"`}>
      <img src="https://cdn.simpleicons.org/${skill.iconSlug}/4cc9ff" data-color="#4cc9ff" alt="" width="56" height="56">
    </span>
  `).join("");

  container.innerHTML = `<div data-skill-marquee>${renderSet()}${renderSet(true)}</div>`;
}

export function renderSkills(container, list = skills) {
  if (!container) return;

  const skillItems = list.map((skill, index) => `
    <article class="skill-item" data-skill-item data-cursor="skill" style="--skill-accent:${skill.accent};--i:${index}">
      <img class="skill-item__mark" src="${skill.logo}" alt="" width="180" height="180" loading="lazy">
      <div class="skill-item__content" data-skill-motion>
        <img class="skill-item__logo" src="${skill.logo}" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>${skill.name}</h3>
          <p>${skill.copy}</p>
          <span>${skill.use}</span>
        </div>
      </div>
    </article>
  `).join("");

  container.innerHTML = `
    <div id="skills-carousel" class="skills__stage" role="region" tabindex="0" aria-label="Tecnologias: deslize horizontalmente para explorar" data-skills-stage>${skillItems}</div>
  `;
}
