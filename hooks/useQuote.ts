"use client";

import { useContext } from "react";
import { QuoteContext } from "@/components/features/quote/QuoteProvider";

export function useQuote() {
  const value = useContext(QuoteContext);
  if (!value) {
    throw new Error("useQuote must be used within QuoteProvider");
  }
  return value;
}
