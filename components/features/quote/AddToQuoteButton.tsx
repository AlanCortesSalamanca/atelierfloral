"use client";

import type { Product } from "@/lib/types";
import { useQuote } from "@/hooks/useQuote";
import { dispatchQuoteFlyAnimation } from "@/components/features/quote/quoteFlyAnimation";

export function AddToQuoteButton({ product, quantity = 1, compact = false }: { product: Product; quantity?: number; compact?: boolean }) {
  const { addProduct } = useQuote();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        addProduct(product, quantity);
        dispatchQuoteFlyAnimation(product, event.currentTarget);
      }}
      className={
        compact
          ? "tap-motion button-soft focus-gold rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm font-semibold text-ink hover:bg-beige/70"
          : "tap-motion button-lift focus-gold rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft"
      }
    >
      Agregar a cotización
    </button>
  );
}
