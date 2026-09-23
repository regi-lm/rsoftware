export function initNavigation() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const closeButton = document.querySelector("[data-menu-close]");
  const menu = document.querySelector("#site-menu");
  const links = menu ? [...menu.querySelectorAll("a")] : [];
  const pageRegions = [...document.querySelectorAll("main, footer")];
  let lockedScrollY = 0;
  let scrollLocked = false;

  const setScrollLock = (locked) => {
    if (locked === scrollLocked) return;

    if (locked) {
      lockedScrollY = window.scrollY;
      document.body.style.top = `-${lockedScrollY}px`;
      document.documentElement.classList.add("nav-open");
      document.body.classList.add("nav-open");
      scrollLocked = true;
      return;
    }

    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    document.body.style.removeProperty("top");
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedScrollY);
    if (previousScrollBehavior) document.documentElement.style.scrollBehavior = previousScrollBehavior;
    else document.documentElement.style.removeProperty("scroll-behavior");
    scrollLocked = false;
  };

  const setMenu = (open, { returnFocus = false } = {}) => {
    toggle?.setAttribute("aria-expanded", String(open));
    setScrollLock(open);
    pageRegions.forEach((region) => {
      region.inert = open;
    });
    if (open) links[0]?.focus();
    else if (returnFocus) toggle?.focus();
  };

  setMenu(false);

  toggle?.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  closeButton?.addEventListener("click", () => setMenu(false, { returnFocus: true }));

  links.forEach((link) => {
    link.addEventListener("click", () => setMenu(false, { returnFocus: true }));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
      setMenu(false, { returnFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && toggle?.getAttribute("aria-expanded") === "true") {
      setMenu(false);
    }
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
