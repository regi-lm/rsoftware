export const skills = [
  {
    name: "HTML",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    copy: "Estrutura semântica e acessível para construir experiências sólidas desde a base.",
    use: "Base de páginas rápidas, SEO e acessibilidade."
  },
  {
    name: "CSS",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    copy: "Responsividade, identidade visual e sistemas de interface que funcionam em qualquer tela.",
    use: "Design systems, layouts fluidos e microinterações."
  },
  {
    name: "JavaScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    copy: "Interações, comportamento e experiências dinâmicas diretamente no navegador.",
    use: "Fluxos interativos, validação e integrações."
  },
  {
    name: "React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    copy: "Interfaces modernas e escaláveis para aplicações que exigem componentes e estados complexos.",
    use: "Produtos com dashboards, estados ricos e evolução contínua."
  },
  {
    name: "Node.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    copy: "APIs, integrações e lógica de servidor para conectar produtos, dados e serviços.",
    use: "Backends, automações e integrações externas."
  },
  {
    name: "Supabase",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
    copy: "Banco de dados, autenticação e infraestrutura para produtos digitais que precisam evoluir rapidamente.",
    use: "MVPs com dados, login e crescimento gradual."
  },
  {
    name: "Git",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    copy: "Versionamento e controle do desenvolvimento para manter cada evolução do projeto organizada e segura.",
    use: "Histórico, colaboração e entregas controladas."
  },
  {
    name: "Vercel",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
    copy: "Deploy, preview e publicação de interfaces web com fluxo rápido, confiável e preparado para produção.",
    use: "Hospedagem, previews e entrega contínua."
  }
];

export function renderSkills(container, list = skills) {
  if (!container) return;

  const marqueeItems = [...list, ...list].map((skill) => `
    <span><img src="${skill.logo}" alt="" width="24" height="24">${skill.name}</span>
  `).join("");

  const skillItems = list.map((skill, index) => `
    <article class="skill-item" data-skill-item data-cursor="skill" style="--i:${index}">
      <img class="skill-item__mark" src="${skill.logo}" alt="" width="180" height="180" loading="lazy">
      <img class="skill-item__logo" src="${skill.logo}" alt="" width="48" height="48" loading="lazy">
      <div>
        <h3>${skill.name}</h3>
        <p>${skill.copy}</p>
        <span>${skill.use}</span>
      </div>
    </article>
  `).join("");

  container.innerHTML = `
    <div class="skills__marquee" data-skill-marquee aria-hidden="true">
      <div>${marqueeItems}</div>
    </div>
    <div class="skills__stage" data-skills-stage>${skillItems}</div>
  `;
}
