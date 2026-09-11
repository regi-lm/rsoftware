import test from "node:test";
import assert from "node:assert/strict";
import { getWhatsAppHref } from "../dist/js/config.js";

test("returns null when WhatsApp number is empty", () => {
  assert.equal(getWhatsAppHref({ whatsappNumber: "" }), null);
});

test("builds encoded WhatsApp URL when a number is configured", () => {
  const href = getWhatsAppHref({
    whatsappNumber: "+55 11 99999-8888",
    whatsappMessage: "Olá! Quero orçamento."
  });

  assert.equal(
    href,
    "https://wa.me/5511999998888?text=Ol%C3%A1!%20Quero%20or%C3%A7amento."
  );
});

test("uses the production WhatsApp destination and forwarding message", () => {
  assert.equal(
    getWhatsAppHref(),
    "https://wa.me/5591984536649?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20RSoftware%20e%20gostaria%20de%20ter%20um%20forte%20posicionamento%20online."
  );
});
