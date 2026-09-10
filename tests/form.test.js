import test from "node:test";
import assert from "node:assert/strict";
import { validateContactForm } from "../dist/js/form.js";

test("rejects empty required fields", () => {
  const result = validateContactForm({
    name: "",
    email: "",
    service: "",
    message: ""
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.name, "Informe seu nome.");
  assert.equal(result.errors.email, "Informe um e-mail válido.");
  assert.equal(result.errors.service, "Escolha um serviço.");
  assert.equal(result.errors.message, "Conte um pouco sobre o projeto.");
});

test("accepts a complete contact request", () => {
  const result = validateContactForm({
    name: "Rafaela Costa",
    email: "rafaela@example.com",
    service: "Sistema",
    message: "Preciso de um sistema para minha empresa."
  });

  assert.deepEqual(result, { valid: true, errors: {} });
});
