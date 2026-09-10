export const CONFIG = {
  siteName: "RSoftware",
  canonicalUrl: "https://rsoftware-site.regi-lima.chatgpt.site/",
  whatsappNumber: "",
  whatsappMessage: "Olá! Conheci a RSoftware pelo site e gostaria de conversar sobre um projeto.",
  formEndpoint: "",
  socialLinks: []
};

export function getWhatsAppHref(options = {}) {
  const number = String(options.number ?? CONFIG.whatsappNumber).replace(/\D/g, "");
  const message = options.message ?? CONFIG.whatsappMessage;

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
