"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/features/products/ProductImage";
import { useQuote } from "@/hooks/useQuote";
import { buildWhatsAppMessage } from "@/lib/services/quote.service";
import { getWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { QuoteFormData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { sanitizeEmail, sanitizeItemName, sanitizeOptional, sanitizePhone, sanitizeText } from "@/lib/utils/sanitize";

const initialForm: QuoteFormData = {
  customer_name: "",
  customer_phone: "",
  customer_instagram: "",
  customer_email: "",
  event_type: "",
  event_date: "",
  custom_notes: "",
  privacy_accepted: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (form.customer_phone.replace(/\D/g, "").length < 10) {
      setError("Escribe un teléfono válido con al menos 10 dígitos.");
      return;
    }

    if (form.customer_email.trim() && !emailPattern.test(form.customer_email.trim())) {
      setError("Escribe un email válido o deja el campo vacío.");
      return;
    }

    if (!form.privacy_accepted) {
      setError("Acepta el aviso de privacidad para enviar la cotización.");
      return;
    }

    const cleanForm: QuoteFormData = {
      customer_name: sanitizeText(form.customer_name, 100),
      customer_phone: sanitizePhone(form.customer_phone),
      customer_instagram: sanitizeOptional(form.customer_instagram, 80) ?? "",
      customer_email: form.customer_email.trim() ? sanitizeEmail(form.customer_email) : "",
      event_type: sanitizeOptional(form.event_type, 120) ?? "",
      event_date: sanitizeOptional(form.event_date, 30) ?? "",
      custom_notes: sanitizeOptional(form.custom_notes, 800) ?? "",
      privacy_accepted: form.privacy_accepted,
    };

    setIsSubmitting(true);
    const sanitizedItems = items.map((item) => ({
      ...item,
      name: sanitizeItemName(item.name),
      slug: sanitizeItemName(item.slug),
      category: sanitizeItemName(item.category),
    }));
    const payload = {
      customer_name: cleanForm.customer_name,
      customer_phone: cleanForm.customer_phone,
      items: sanitizedItems,
      status: "new",
      privacy_accepted: true,
      customer_instagram: cleanForm.customer_instagram || null,
      customer_email: cleanForm.customer_email || null,
      event_type: cleanForm.event_type || null,
      event_date: cleanForm.event_date || null,
      custom_notes: cleanForm.custom_notes || null,
    };

    let response: Response;
    try {
      response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setError("No se pudo enviar la cotización en este momento. Inténtalo de nuevo más tarde.");
      setIsSubmitting(false);
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "No se pudo enviar la cotización en este momento. Inténtalo de nuevo más tarde.");
      setIsSubmitting(false);
      return;
    }

    const whatsappUrl = getWhatsAppUrl(buildWhatsAppMessage(sanitizedItems, cleanForm));
    clear();
    setForm(initialForm);
    window.location.href = whatsappUrl;
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
                      <button type="button" aria-label={`Disminuir cantidad de ${item.name}`} onClick={() => decrease(item.productId)} className="tap-motion button-quantity focus-gold rounded-full border border-beige px-3 py-1 font-semibold">
                        -
                      </button>
                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                      <button type="button" aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => increase(item.productId)} className="tap-motion button-quantity focus-gold rounded-full border border-beige px-3 py-1 font-semibold">
                        +
                      </button>
                      <button type="button" onClick={() => remove(item.productId)} className="tap-motion focus-gold ml-auto rounded-full px-2 py-1 text-sm font-semibold text-coffee underline-offset-4 hover:text-ink hover:underline">
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
              <Link href="/catalogo" className="tap-motion button-lift focus-gold mt-5 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft">
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
            <span className="mt-1 block text-right text-xs font-medium text-coffee">{form.custom_notes.length}/800</span>
          </label>
          <label className="mt-5 flex gap-3 rounded-3xl border border-beige bg-cream/60 p-4 text-sm leading-6 text-coffee">
            <input
              type="checkbox"
              checked={form.privacy_accepted}
              onChange={(event) => setForm({ ...form, privacy_accepted: event.target.checked })}
              className="mt-1 h-4 w-4 shrink-0 accent-ink"
            />
            <span>
              Acepto el tratamiento de mis datos personales conforme al {" "}
              <Link href="/aviso-de-privacidad" target="_blank" className="font-semibold text-ink underline underline-offset-4">
                Aviso de privacidad
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p role="alert" className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={isSubmitting} className="tap-motion button-lift focus-gold mt-6 w-full rounded-full bg-ink px-6 py-4 font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft disabled:cursor-not-allowed disabled:animate-pulse disabled:hover:bg-ink disabled:hover:shadow-card">
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
