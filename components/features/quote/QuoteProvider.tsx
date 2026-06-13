"use client";

import { createContext, useEffect, useState } from "react";
import { QuoteFlyToCart } from "@/components/features/quote/QuoteFlyToCart";
import type { QuotableProduct, QuoteItem } from "@/lib/types";
import { getQuotePieces, getQuoteSubtotal, productToQuoteItem } from "@/lib/services/quote.service";

export type QuoteContextValue = {
  items: QuoteItem[];
  addProduct: (product: QuotableProduct, quantity?: number) => void;
  increase: (productId: number) => void;
  decrease: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  subtotal: number;
  totalPieces: number;
};

export const QuoteContext = createContext<QuoteContextValue | null>(null);
export const quoteStorageKey = "atelier-floral-quote";

function isQuoteItem(value: unknown): value is QuoteItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "number" &&
    Number.isInteger(item.productId) &&
    typeof item.slug === "string" &&
    item.slug.trim().length > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.category === "string" &&
    item.category.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    (typeof item.image === "string" || item.image === null) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 999
  );
}

function parseStoredQuote(value: string): QuoteItem[] | null {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) return null;

  const migrated = parsed.map((item) => {
    if (!item || typeof item !== "object") return item;
    const record = item as Record<string, unknown>;
    if (typeof record.productId === "string" && /^\d+$/.test(record.productId)) {
      return { ...record, productId: Number(record.productId) };
    }
    return item;
  });

  if (!migrated.every(isQuoteItem)) return null;
  return migrated;
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(quoteStorageKey);
    if (saved) {
      try {
        const parsed = parseStoredQuote(saved);
        if (parsed) {
          setItems(parsed);
        } else {
          window.localStorage.removeItem(quoteStorageKey);
        }
      } catch {
        window.localStorage.removeItem(quoteStorageKey);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(quoteStorageKey, JSON.stringify(items));
    }
  }, [items, loaded]);

  function addProduct(product: QuotableProduct, quantity = 1) {
    const productId = product.id;
    const safeQuantity = Math.max(1, Math.min(999, quantity));

    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(999, item.quantity + safeQuantity) } : item));
      }
      return [...current, productToQuoteItem(product, safeQuantity)];
    });
  }

  function increase(productId: number) {
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(999, item.quantity + 1) } : item)));
  }

  function decrease(productId: number) {
    setItems((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function remove(productId: number) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function clear() {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify([]));
    setItems([]);
  }

  return (
    <QuoteContext.Provider
      value={{ items, addProduct, increase, decrease, remove, clear, subtotal: getQuoteSubtotal(items), totalPieces: getQuotePieces(items) }}
    >
      <QuoteFlyToCart />
      {children}
    </QuoteContext.Provider>
  );
}
