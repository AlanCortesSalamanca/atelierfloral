"use client";

import type { Product } from "@/lib/types";
import { useQuote } from "@/hooks/useQuote";

export function AddToQuoteButton({ product, quantity = 1, compact = false }: { product: Product; quantity?: number; compact?: boolean }) {
  const { addProduct } = useQuote();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        addProduct(product, quantity);
      }}
      className={
        compact
          ? "rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm font-semibold text-ink transition hover:bg-beige/70"
          : "rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-card transition hover:bg-coffee"
      }
    >
      Agregar a cotización
    </button>
  );
}
