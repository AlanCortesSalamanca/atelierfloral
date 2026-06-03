"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/features/products/ProductImage";
import { useQuote } from "@/hooks/useQuote";
import { getSupabaseClient } from "@/lib/db/supabase";
import { buildWhatsAppMessage } from "@/lib/services/quote.service";
import { getWhatsAppUrl } from "@/lib/services/whatsapp.service";
import type { QuoteFormData, QuoteRequestInsert } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

const initialForm: QuoteFormData = {
  customer_name: "",
  customer_phone: "",
  customer_instagram: "",
  customer_email: "",
  event_type: "",
  event_date: "",
  custom_notes: "",
};

export function QuotePageClient() {
  const { items, increase, decrease, remove, clear, subtotal, totalPieces } = useQuote();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Agrega al menos un producto a tu cotización.");
      return;
    }

    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError("Completa tu nombre y teléfono para enviar la cotización.");
      return;
    }

    setIsSubmitting(true);
    const payload: QuoteRequestInsert = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      items,
      unique_products: items.length,
      desired_total_pieces: totalPieces,
      estimated_subtotal: subtotal,
      status: "new",
      customer_instagram: form.customer_instagram.trim() || null,
      customer_email: form.customer_email.trim() || null,
      event_type: form.event_type.trim() || null,
      event_date: form.event_date || null,
      custom_notes: form.custom_notes.trim() || null,
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("No se pudo enviar la cotización en este momento. Inténtalo de nuevo más tarde.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("quote_requests").insert(payload);
    if (insertError) {
      setError("No se pudo enviar la cotización en este momento. Inténtalo de nuevo más tarde.");
      setIsSubmitting(false);
      return;
    }

    const whatsappUrl = getWhatsAppUrl(buildWhatsAppMessage(items, form));
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    clear();
    setForm(initialForm);
    setIsSubmitting(false);
  }

  return (
    <main className="container-page section-pad">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Cotización</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Revisa tus productos</h1>
        <p className="mt-4 text-lg leading-8 text-coffee">Completa tus datos y enviaremos la solicitud por WhatsApp después de guardarla en Supabase.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-card">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[84px_1fr] gap-4 rounded-3xl bg-cream/70 p-3">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-beige">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl text-ink">{item.name}</h2>
                    <p className="text-sm text-coffee">{item.category}</p>
                    <p className="mt-1 font-semibold text-ink">{formatCurrency(item.price * item.quantity)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => decrease(item.productId)} className="rounded-full border border-beige px-3 py-1 font-semibold">
                        -
                      </button>
                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => increase(item.productId)} className="rounded-full border border-beige px-3 py-1 font-semibold">
                        +
                      </button>
                      <button type="button" onClick={() => remove(item.productId)} className="ml-auto text-sm font-semibold text-coffee underline-offset-4 hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-3xl bg-ink p-5 text-cream">
                <div className="flex justify-between gap-4">
                  <span>Piezas totales</span>
                  <strong>{totalPieces}</strong>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span>Subtotal estimado</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-coffee">
              <p>No tienes productos en tu cotización.</p>
              <Link href="/catalogo" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-cream">
                Ver catálogo
              </Link>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-card sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" value={form.customer_name} required onChange={(value) => setForm({ ...form, customer_name: value })} />
            <Field label="Teléfono" value={form.customer_phone} required onChange={(value) => setForm({ ...form, customer_phone: value })} />
            <Field label="Instagram" value={form.customer_instagram} onChange={(value) => setForm({ ...form, customer_instagram: value })} />
            <Field label="Email" type="email" value={form.customer_email} onChange={(value) => setForm({ ...form, customer_email: value })} />
            <Field label="Tipo de evento" value={form.event_type} onChange={(value) => setForm({ ...form, event_type: value })} />
            <Field label="Fecha del evento" type="date" value={form.event_date} onChange={(value) => setForm({ ...form, event_date: value })} />
          </div>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Notas adicionales
            <textarea value={form.custom_notes} onChange={(event) => setForm({ ...form, custom_notes: event.target.value })} rows={5} maxLength={800} className="mt-2 w-full rounded-3xl border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" />
          </label>
          {error ? <p className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-full bg-ink px-6 py-4 font-semibold text-cream shadow-card transition hover:bg-coffee disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Enviando..." : "Guardar y cotizar por WhatsApp"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <input type={type} value={value} required={required} maxLength={120} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" />
    </label>
  );
}
