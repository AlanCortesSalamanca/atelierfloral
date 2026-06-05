const HTML_TAG_RE = /<[^>]*>/g;

export function stripHtml(value: string): string {
  return value.replace(HTML_TAG_RE, "");
}

export function sanitizeText(value: string, maxLength = 500): string {
  return stripHtml(value).trim().slice(0, maxLength);
}

export function sanitizeOptional(value: unknown, maxLength = 120): string | null {
  if (typeof value !== "string") return null;
  const cleaned = sanitizeText(value, maxLength);
  return cleaned || null;
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 20);
}

export function sanitizeEmail(value: string): string {
  return stripHtml(value).trim().toLowerCase().slice(0, 120);
}

export function sanitizeWhatsApp(value: string): string {
  return stripHtml(value)
    .replace(/[\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function sanitizeItemName(value: string): string {
  return stripHtml(value).trim().slice(0, 200);
}

export function sanitizeProductText(value: string | null, maxLength = 2000): string | null {
  if (!value) return null;
  const cleaned = stripHtml(value).trim().slice(0, maxLength);
  return cleaned || null;
}
