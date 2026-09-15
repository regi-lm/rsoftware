const unknownTechnologyMark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect width='28' height='28' rx='5' fill='%23151a1f'/%3E%3Cpath d='M8 9h12M8 14h12M8 19h12' stroke='%23aab4bf' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

const technologyIcons = Object.freeze({
  HTML: Object.freeze({ name: "HTML", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }),
  CSS: Object.freeze({ name: "CSS", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" }),
  JavaScript: Object.freeze({ name: "JavaScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" }),
  React: Object.freeze({ name: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" }),
  "Node.js": Object.freeze({ name: "Node.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" }),
  Supabase: Object.freeze({ name: "Supabase", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" }),
  GSAP: Object.freeze({ name: "GSAP", src: "https://cdn.simpleicons.org/greensock/88CE02" })
});

export function getTechnologyIcon(name) {
  return technologyIcons[name] ?? { name, src: unknownTechnologyMark };
}
