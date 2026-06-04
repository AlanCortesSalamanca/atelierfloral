import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db/supabase";
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

function sanitizeOptional(value: unknown, maxLength = 120) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<QuoteRequestInsert> | null;

  if (!body || !Array.isArray(body.items) || body.items.length === 0 || !body.items.every(isQuoteItem)) {
    return NextResponse.json({ error: "Datos de cotización inválidos" }, { status: 400 });
  }

  const customerName = sanitizeOptional(body.customer_name, 100);
  const customerPhone = sanitizeOptional(body.customer_phone, 30);
  const phoneDigits = customerPhone?.replace(/\D/g, "") ?? "";

  if (!customerName || !customerPhone || phoneDigits.length < 10) {
    return NextResponse.json({ error: "Datos del cliente inválidos" }, { status: 400 });
  }

  if (body.customer_email && typeof body.customer_email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email.trim())) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (body.event_date && typeof body.event_date === "string" && Number.isNaN(new Date(body.event_date).getTime())) {
    return NextResponse.json({ error: "Fecha de evento inválida" }, { status: 400 });
  }

  const items = body.items;
  const payload: QuoteRequestInsert = {
    customer_name: customerName,
    customer_phone: customerPhone,
    items,
    unique_products: items.length,
    desired_total_pieces: items.reduce((total, item) => total + item.quantity, 0),
    estimated_subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    status: "new",
    customer_instagram: sanitizeOptional(body.customer_instagram, 80),
    customer_email: sanitizeOptional(body.customer_email, 120),
    event_type: sanitizeOptional(body.event_type, 120),
    event_date: sanitizeOptional(body.event_date, 30),
    custom_notes: sanitizeOptional(body.custom_notes, 800),
  };

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  const { error } = await supabase.from("quote_requests").insert(payload);
  if (error) {
    console.error("[POST /api/quote] Supabase insert failed:", error.message);
    return NextResponse.json({ error: "No se pudo crear la cotización" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
