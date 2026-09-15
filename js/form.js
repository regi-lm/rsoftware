const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(data) {
  const errors = {};
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const service = String(data.service ?? "").trim();
  const message = String(data.message ?? "").trim();

  if (!name) errors.name = "Informe seu nome.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Informe um e-mail válido.";
  if (!service) errors.service = "Escolha um serviço.";
  if (!message) errors.message = "Conte um pouco sobre o projeto.";

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function initContactForm(form, config = {}) {
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[type='submit']");

  const setError = (name, message = "") => {
    const field = form.elements[name];
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (!field || !error) return;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const values = Object.fromEntries(new FormData(form).entries());
    const result = validateContactForm(values);
    ["name", "email", "service", "message"].forEach((name) => setError(name, result.errors[name]));

    if (!result.valid) {
      status.textContent = "Revise os campos destacados antes de enviar.";
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }

    if (!config.formEndpoint) {
      status.textContent = "Solicitação validada. Configure um endpoint em js/config.js para ativar o envio.";
      form.reset();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    status.textContent = "Enviando sua solicitação.";

    try {
      const response = await fetch(config.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error("Request failed");
      status.textContent = "Solicitação enviada. Entraremos em contato em breve.";
      form.reset();
    } catch {
      status.textContent = "Não foi possível enviar agora. Tente novamente ou use o WhatsApp.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar solicitação";
    }
  });
}
