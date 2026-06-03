"use client";

import Link from "next/link";
import { useQuote } from "@/hooks/useQuote";

export function QuoteSummaryButton() {
  const { totalPieces } = useQuote();

  return (
    <Link href="/cotizacion" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-card transition hover:bg-coffee">
      Cotización {totalPieces > 0 ? `(${totalPieces})` : ""}
    </Link>
  );
}
