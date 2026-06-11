"use client";

import Link from "next/link";
import { useQuote } from "@/hooks/useQuote";

export function QuoteSummaryButton() {
  const { totalPieces } = useQuote();

  return (
    <Link href="/cotizacion" data-quote-summary-target className="tap-motion button-lift focus-gold rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft">
      Cotización {totalPieces > 0 ? `(${totalPieces})` : ""}
    </Link>
  );
}
