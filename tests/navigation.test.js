import test from "node:test";
import assert from "node:assert/strict";
import { initNavigation } from "../dist/js/navigation.js";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

class FakeElement extends FakeEventTarget {
  constructor() {
    super();
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.focusCount = 0;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  focus() {
    this.focusCount += 1;
  }
}

function createNavigationFixture() {
  const header = new FakeElement();
  const toggle = new FakeElement();
  const links = [new FakeElement(), new FakeElement()];
  const menu = new FakeElement();
  menu.querySelectorAll = () => links;

  const fakeDocument = new FakeEventTarget();
  fakeDocument.body = new FakeElement();
  const pageRegions = [new FakeElement(), new FakeElement()];
  fakeDocument.querySelector = (selector) => ({
    "[data-header]": header,
    "[data-menu-toggle]": toggle,
    "#site-menu": menu
  })[selector] ?? null;
  fakeDocument.querySelectorAll = (selector) => selector === "main, footer" ? pageRegions : [];

  const fakeWindow = new FakeEventTarget();
  fakeWindow.scrollY = 0;
  fakeWindow.innerWidth = 390;

  globalThis.document = fakeDocument;
  globalThis.window = fakeWindow;

  initNavigation();

  return { fakeDocument, fakeWindow, header, toggle, links, pageRegions };
}

test.afterEach(() => {
  delete globalThis.document;
  delete globalThis.window;
});

test("exposes the correct accessible action while the mobile menu toggles", () => {
  const { toggle } = createNavigationFixture();

  assert.equal(toggle.getAttribute("aria-label"), "Abrir menu");

  toggle.dispatch("click");
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Fechar menu");

  toggle.dispatch("click");
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-label"), "Abrir menu");
});

test("Escape closes the mobile menu and returns focus to its toggle", () => {
  const { fakeDocument, toggle } = createNavigationFixture();

  toggle.dispatch("click");
  fakeDocument.dispatch("keydown", { key: "Escape" });

  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.focusCount, 1);
});

test("returning to the desktop breakpoint closes the mobile menu", () => {
  const { fakeWindow, toggle } = createNavigationFixture();

  toggle.dispatch("click");
  fakeWindow.innerWidth = 1200;
  fakeWindow.dispatch("resize");

  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

test("opening isolates the page and choosing a link restores it and the toggle focus", () => {
  const { fakeDocument, toggle, links, pageRegions } = createNavigationFixture();

  toggle.dispatch("click");

  assert.equal(fakeDocument.body.classList.contains("nav-open"), true);
  assert.equal(links[0].focusCount, 1);
  assert.deepEqual(pageRegions.map((region) => region.inert), [true, true]);

  links[1].dispatch("click");

  assert.equal(fakeDocument.body.classList.contains("nav-open"), false);
  assert.equal(toggle.focusCount, 1);
  assert.deepEqual(pageRegions.map((region) => region.inert), [false, false]);
});
