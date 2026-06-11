"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/features/products/ProductImage";
import { useQuote } from "@/hooks/useQuote";
import { dispatchQuoteFlyAnimation } from "@/components/features/quote/quoteFlyAnimation";
import { buildWhatsAppMessage, productToQuoteItem } from "@/lib/services/quote.service";
import { getWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const { addProduct } = useQuote();
  const gallery = [product.image, ...(product.gallery_images ?? [])].filter(Boolean) as string[];
  const materials = Array.isArray(product.materials) ? product.materials.join(", ") : product.materials;
  const whatsappUrl = getWhatsAppUrl(buildWhatsAppMessage([productToQuoteItem(product, quantity)]));

  return (
    <main className="container-page section-pad">
      <Link href="/catalogo" className="tap-motion focus-gold mb-8 inline-block rounded-full text-sm font-semibold text-coffee underline-offset-4 hover:text-ink hover:underline">
        Volver al catálogo
      </Link>
      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <div data-product-detail-image className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-beige shadow-soft">
            <ProductImage src={selectedImage} alt={product.name} />
          </div>
          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image) => (
                <button key={image} type="button" aria-label={`Ver imagen de ${product.name}`} onClick={() => setSelectedImage(image)} className="tap-motion button-soft focus-gold relative aspect-square overflow-hidden rounded-2xl border border-white/70 bg-beige shadow-card hover:border-gold/70 hover:shadow-soft">
                  <ProductImage src={image} alt={product.name} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="rounded-[2.5rem] border border-white/70 bg-white/65 p-6 shadow-card sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-sage">{product.category}</p>
          <h1 className="mt-3 font-heading text-5xl leading-tight text-ink">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-coffee">{formatCurrency(Number(product.price ?? 0))}</p>
          {product.description ? <p className="mt-5 text-lg leading-8 text-coffee">{product.description}</p> : null}

          <div className="mt-7 grid gap-3 text-sm text-coffee">
            {materials ? <DetailRow label="Materiales" value={materials} /> : null}
            {product.fragrance ? <DetailRow label="Fragancia" value={product.fragrance} /> : null}
            {product.dimensions ? <DetailRow label="Dimensiones" value={product.dimensions} /> : null}
            {product.handcrafted_details ? <DetailRow label="Detalles artesanales" value={product.handcrafted_details} /> : null}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="font-semibold text-ink">Cantidad</span>
            <div className="flex items-center overflow-hidden rounded-full border border-beige bg-cream">
              <button type="button" aria-label="Disminuir cantidad" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="tap-motion button-quantity focus-gold px-4 py-2 text-lg font-semibold text-ink">
                -
              </button>
              <span className="min-w-10 text-center font-semibold">{quantity}</span>
              <button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity((value) => Math.min(999, value + 1))} className="tap-motion button-quantity focus-gold px-4 py-2 text-lg font-semibold text-ink">
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={(event) => {
                addProduct(product, quantity);
                dispatchQuoteFlyAnimation(product, event.currentTarget, selectedImage);
              }}
              className="tap-motion button-lift focus-gold rounded-full bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft"
            >
              Agregar a cotización
            </button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="tap-motion button-soft focus-gold rounded-full border border-gold/70 bg-cream px-6 py-3 text-center font-semibold text-ink hover:bg-beige/70">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream/70 p-4">
      <p className="font-bold text-ink">{label}</p>
      <p className="mt-1 leading-6">{value}</p>
    </div>
  );
}
