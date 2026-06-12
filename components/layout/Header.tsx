import Link from "next/link";
import { QuoteSummaryButton } from "@/components/features/quote/QuoteSummaryButton";
import { siteContent } from "@/lib/constants/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-cream/85 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="tap-motion focus-gold rounded-full font-heading text-xl font-semibold tracking-wide text-ink hover:text-coffee">
          {siteContent.name}
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium text-coffee">
          <Link href="/catalogo" className="tap-motion focus-gold hidden rounded-full px-2 py-1 hover:text-ink sm:inline">
            Catálogo
          </Link>
          <QuoteSummaryButton />
        </div>
      </nav>
    </header>
  );
}
