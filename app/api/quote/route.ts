import { getSupabaseClient } from "@/lib/db/supabase";
import { corsErrorResponse, corsSuccessResponse, getCorsOrigin, handleOptionsRequest } from "@/lib/utils/cors";
import { createRateLimit } from "@/lib/utils/rate-limit";
import { sanitizeEmail, sanitizeItemName, sanitizeOptional, sanitizePhone } from "@/lib/utils/sanitize";
import type { QuoteItem, QuoteRequestInsert } from "@/lib/types";

function isQuoteItem(item: unknown): item is QuoteItem {
  if (!item || typeof item !== "object") return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.productId === "number" &&
    Number.isInteger(value.productId) &&
    typeof value.slug === "string" &&
    value.slug.trim().length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.category === "string" &&
    value.category.trim().length > 0 &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    value.quantity <= 999 &&
    (typeof value.image === "string" || value.image === null)
  );
}

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

export async function POST(request: Request) {
  const origin = getCorsOrigin(request);

  if (origin === null && request.headers.get("origin")) {
    return corsErrorResponse();
  }

  const ratelimit = createRateLimit();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return corsSuccessResponse(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      origin,
      429,
    );
  }

  const body = (await request.json().catch(() => null)) as Partial<QuoteRequestInsert> | null;

  if (!body || !Array.isArray(body.items) || body.items.length === 0 || !body.items.every(isQuoteItem)) {
    return corsSuccessResponse({ error: "Datos de cotización inválidos" }, origin, 400);
  }

  if (body.privacy_accepted !== true) {
    return corsSuccessResponse({ error: "Debes aceptar el aviso de privacidad" }, origin, 400);
  }

  const customerName = sanitizeOptional(body.customer_name, 100);
  const customerPhone = sanitizeOptional(body.customer_phone, 30);
  const phoneDigits = customerPhone ? sanitizePhone(customerPhone) : "";

  if (!customerName || !customerPhone || phoneDigits.length < 10) {
    return corsSuccessResponse({ error: "Datos del cliente inválidos" }, origin, 400);
  }

  const rawEmail = body.customer_email;
  const cleanedEmail = typeof rawEmail === "string" ? sanitizeEmail(rawEmail) : "";
  if (cleanedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
    return corsSuccessResponse({ error: "Email inválido" }, origin, 400);
  }

  if (body.event_date && typeof body.event_date === "string" && Number.isNaN(new Date(body.event_date).getTime())) {
    return corsSuccessResponse({ error: "Fecha de evento inválida" }, origin, 400);
  }

  const items = body.items.map((item) => ({
    ...item,
    name: sanitizeItemName(item.name),
    slug: sanitizeItemName(item.slug),
    category: sanitizeItemName(item.category),
  }));

  if (items.some((item) => !item.name || !item.slug || !item.category)) {
    return corsSuccessResponse({ error: "Productos inválidos" }, origin, 400);
  }

  const payload: QuoteRequestInsert = {
    customer_name: customerName,
    customer_phone: phoneDigits,
    items,
    unique_products: items.length,
    desired_total_pieces: items.reduce((total, item) => total + item.quantity, 0),
    estimated_subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    status: "new",
    privacy_accepted: true,
    customer_instagram: sanitizeOptional(body.customer_instagram, 80),
    customer_email: cleanedEmail || null,
    event_type: sanitizeOptional(body.event_type, 120),
    event_date: sanitizeOptional(body.event_date, 30),
    custom_notes: sanitizeOptional(body.custom_notes, 800),
  };

  const supabase = getSupabaseClient();
  if (!supabase) {
    return corsSuccessResponse({ error: "Servicio no disponible" }, origin, 503);
  }

  const { error } = await supabase.from("quote_requests").insert(payload);
  if (error) {
    console.error("[POST /api/quote] Supabase insert failed:", error.message);
    return corsSuccessResponse({ error: "No se pudo crear la cotización" }, origin, 500);
  }

  return corsSuccessResponse({ ok: true }, origin);
}
