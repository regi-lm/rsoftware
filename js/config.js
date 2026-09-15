export const CONFIG = {
  siteName: "RSoftware",
  canonicalUrl: "https://rsoftware-site.regi-lima.chatgpt.site/",
  whatsappNumber: "+5591984536649",
  whatsappMessage: "Olá! Vim pelo site da RSoftware e gostaria de ter um forte posicionamento online.",
  formEndpoint: "",
  socialLinks: []
};

export function getWhatsAppHref(config = CONFIG) {
  const number = String(config.whatsappNumber ?? "").replace(/\D/g, "");
  const message = config.whatsappMessage ?? "";

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
