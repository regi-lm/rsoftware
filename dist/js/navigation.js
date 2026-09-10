export function initNavigation() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("#site-menu");
  const links = menu ? [...menu.querySelectorAll("a")] : [];

  const setMenu = (open) => {
    toggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    if (open) links[0]?.focus();
  };

  toggle?.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
