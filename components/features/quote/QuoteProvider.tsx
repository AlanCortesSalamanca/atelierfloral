"use client";

import { createContext, useEffect, useState } from "react";
import type { Product, QuoteItem } from "@/lib/types";
import { getQuotePieces, getQuoteSubtotal, productToQuoteItem } from "@/lib/services/quote.service";

export type QuoteContextValue = {
  items: QuoteItem[];
  addProduct: (product: Product, quantity?: number) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  totalPieces: number;
};

export const QuoteContext = createContext<QuoteContextValue | null>(null);
const storageKey = "atelier-floral-quote";

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved) as QuoteItem[]);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, loaded]);

  function addProduct(product: Product, quantity = 1) {
    const productId = String(product.id);

    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...current, productToQuoteItem(product, quantity)];
    });
  }

  function increase(productId: string) {
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)));
  }

  function decrease(productId: string) {
    setItems((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function remove(productId: string) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  return (
    <QuoteContext.Provider
      value={{ items, addProduct, increase, decrease, remove, clear, subtotal: getQuoteSubtotal(items), totalPieces: getQuotePieces(items) }}
    >
      {children}
    </QuoteContext.Provider>
  );
}
