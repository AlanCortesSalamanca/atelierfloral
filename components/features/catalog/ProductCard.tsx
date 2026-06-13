"use client";

import Link from "next/link";
import { AddToQuoteButton } from "@/components/features/quote/AddToQuoteButton";
import { ProductImage } from "@/components/features/products/ProductImage";
import type { ProductSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article data-product-card className="tap-motion button-soft group overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-card hover:shadow-soft">
      <Link href={`/productos/${product.slug}`} className="tap-motion focus-gold block rounded-t-[2rem]">
        <div data-product-image-source className="relative aspect-[4/3] overflow-hidden bg-beige">
          <ProductImage src={product.image} alt={product.name} />
        </div>
        <div className="p-5 pb-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-sage">{product.category}</p>
          <h3 className="font-heading text-2xl leading-tight text-ink transition group-hover:text-coffee">{product.name}</h3>
          {product.description ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-coffee">{product.description}</p> : null}
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-ink">{formatCurrency(Number(product.price ?? 0))}</p>
          <AddToQuoteButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
