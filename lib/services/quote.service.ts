import type { Product, QuoteFormData, QuoteItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function productToQuoteItem(product: Product, quantity = 1): QuoteItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Number(product.price ?? 0),
    image: product.image,
    quantity,
  };
}

export function getQuoteSubtotal(items: QuoteItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getQuotePieces(items: QuoteItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function buildWhatsAppMessage(items: QuoteItem[], form?: Partial<QuoteFormData>) {
  const subtotal = getQuoteSubtotal(items);
  const pieces = getQuotePieces(items);
  const lines = [
    "Hola, quiero cotizar estos productos:",
    "",
    ...items.map((item) => `- ${item.quantity} x ${item.name} (${item.category}) - ${formatCurrency(item.price * item.quantity)}`),
    "",
    `Total estimado: ${formatCurrency(subtotal)}`,
    `Piezas totales: ${pieces}`,
  ];

  if (form?.customer_name || form?.customer_phone || form?.event_type || form?.event_date || form?.custom_notes) {
    lines.push(
      "",
      "Datos del cliente:",
      form.customer_name ? `Nombre: ${form.customer_name}` : "",
      form.customer_phone ? `Teléfono: ${form.customer_phone}` : "",
      form.customer_instagram ? `Instagram: ${form.customer_instagram}` : "",
      form.customer_email ? `Email: ${form.customer_email}` : "",
      form.event_type ? `Evento: ${form.event_type}` : "",
      form.event_date ? `Fecha: ${form.event_date}` : "",
      form.custom_notes ? `Notas: ${form.custom_notes}` : "",
    );
  }

  return lines.filter(Boolean).join("\n");
}
