import test from "node:test";
import assert from "node:assert/strict";
import { getWhatsAppHref } from "../dist/js/config.js";

test("returns null when WhatsApp number is empty", () => {
  assert.equal(getWhatsAppHref({ number: "" }), null);
});

test("builds encoded WhatsApp URL when a number is configured", () => {
  const href = getWhatsAppHref({
    number: "+55 11 99999-8888",
    message: "Olá! Quero orçamento."
  });

  assert.equal(
    href,
    "https://wa.me/5511999998888?text=Ol%C3%A1!%20Quero%20or%C3%A7amento."
  );
});
