"use client";

import { useRouter } from "next/navigation";
import { AddToQuoteButton } from "@/components/features/quote/AddToQuoteButton";
import { ProductImage } from "@/components/features/products/ProductImage";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/productos/${product.slug}`)}
      onKeyDown={(event) => event.key === "Enter" && router.push(`/productos/${product.slug}`)}
      className="group cursor-pointer overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-beige">
        <ProductImage src={product.image} alt={product.name} />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-sage">{product.category}</p>
          <h3 className="font-heading text-2xl leading-tight text-ink transition group-hover:text-coffee">{product.name}</h3>
        </div>
        {product.description ? <p className="line-clamp-2 text-sm leading-6 text-coffee">{product.description}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-ink">{formatCurrency(Number(product.price ?? 0))}</p>
          <AddToQuoteButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
