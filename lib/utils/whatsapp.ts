import { siteConfig } from "@/lib/config";

export function getWhatsAppUrl(message: string) {
  const phone = siteConfig.whatsappPhone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
