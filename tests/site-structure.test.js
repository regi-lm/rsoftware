import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../dist/index.html", import.meta.url);

test("ships an accessible floating WhatsApp action", async () => {
  const html = await readFile(indexUrl, "utf8");
  assert.match(html, /class="whatsapp-float"[^>]*data-whatsapp/);
  assert.match(html, /aria-label="Falar no WhatsApp"/);
});
