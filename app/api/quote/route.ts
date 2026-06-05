import { getSupabaseClient } from "@/lib/db/supabase";
import { corsErrorResponse, corsSuccessResponse, getCorsOrigin, handleOptionsRequest } from "@/lib/utils/cors";
import { createRateLimit } from "@/lib/utils/rate-limit";
import { sanitizeEmail, sanitizeItemName, sanitizeOptional, sanitizePhone } from "@/lib/utils/sanitize";
import type { QuoteItem, QuoteRequestInsert } from "@/lib/types";

function isQuoteItem(item: unknown): item is QuoteItem {
  if (!item || typeof item !== "object") return false;
  const value = item as Record<string, unknown>;
  return (
    typeof value.productId === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.price === "number" &&
    typeof value.quantity === "number" &&
    value.quantity > 0 &&
    (typeof value.image === "string" || value.image === null)
  );
}

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

export async function POST(request: Request) {
  const origin = getCorsOrigin(request);

  if (origin === null && request.headers.get("origin")) {
    return corsErrorResponse(request.headers.get("origin"));
  }

  const ratelimit = createRateLimit();
  if (ratelimit) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return corsSuccessResponse(
        { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
        origin,
        429,
      );
    }
  }

  const body = (await request.json().catch(() => null)) as Partial<QuoteRequestInsert> | null;

  if (!body || !Array.isArray(body.items) || body.items.length === 0 || !body.items.every(isQuoteItem)) {
    return corsSuccessResponse({ error: "Datos de cotización inválidos" }, origin, 400);
  }

  const customerName = sanitizeOptional(body.customer_name, 100);
  const customerPhone = sanitizeOptional(body.customer_phone, 30);
  const phoneDigits = customerPhone ? sanitizePhone(customerPhone) : "";

  if (!customerName || !customerPhone || phoneDigits.length < 10) {
    return corsSuccessResponse({ error: "Datos del cliente inválidos" }, origin, 400);
  }

  const rawEmail = body.customer_email;
  if (rawEmail && typeof rawEmail === "string") {
    const cleaned = sanitizeEmail(rawEmail);
    if (cleaned && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return corsSuccessResponse({ error: "Email inválido" }, origin, 400);
    }
  }

  if (body.event_date && typeof body.event_date === "string" && Number.isNaN(new Date(body.event_date).getTime())) {
    return corsSuccessResponse({ error: "Fecha de evento inválida" }, origin, 400);
  }

  const items = body.items.map((item) => ({
    ...item,
    name: sanitizeItemName(item.name),
    slug: sanitizeItemName(item.slug),
  }));
  const payload: QuoteRequestInsert = {
    customer_name: customerName,
    customer_phone: phoneDigits,
    items,
    unique_products: items.length,
    desired_total_pieces: items.reduce((total, item) => total + item.quantity, 0),
    estimated_subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    status: "new",
    customer_instagram: sanitizeOptional(body.customer_instagram, 80),
    customer_email: rawEmail && typeof rawEmail === "string" ? sanitizeEmail(rawEmail) : null,
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
