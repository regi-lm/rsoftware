import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../dist/index.html", import.meta.url);

test("mobile navigation groups its links before the legal footer", async () => {
  const html = await readFile(indexUrl, "utf8");
  const menu = html.match(/<nav id="site-menu"[\s\S]*?<\/nav>/)?.[0] ?? "";

  const linksStart = menu.indexOf('class="site-nav__links"');
  const footerStart = menu.indexOf('class="site-nav__footer"');

  assert.ok(linksStart >= 0, "navigation links must have their own layout group");
  assert.ok(footerStart > linksStart, "the legal footer must follow the navigation links");
  assert.match(menu, /© 2026[\s\S]*R[\s\S]*Software[\s\S]*Todos os direitos reservados\./);
});
