"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/features/catalog/ProductCard";
import { productCategories } from "@/lib/constants/categories";
import type { Product } from "@/lib/types";

export function CatalogClient({ products, initialCategory = "Todos" }: { products: Product[]; initialCategory?: string }) {
  const categories = productCategories;
  const normalizedInitialCategory = categories.includes(initialCategory as (typeof categories)[number]) ? initialCategory : "Todos";
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoria") ?? normalizedInitialCategory;
  const selectedCategory = categories.includes(categoryParam as (typeof categories)[number]) ? categoryParam : "Todos";
  const filteredProducts = useMemo(
    () => (selectedCategory === "Todos" ? products : products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase())),
    [products, selectedCategory],
  );

  function selectCategory(category: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (category !== "Todos") {
      nextSearchParams.set("categoria", category);
    } else {
      nextSearchParams.delete("categoria");
    }
    const query = nextSearchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <section className="container-page section-pad">
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => selectCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`tap-motion button-soft focus-gold whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ${
              selectedCategory === category ? "bg-ink text-cream shadow-card hover:shadow-soft" : "border border-beige bg-white/60 text-coffee hover:bg-beige/60"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-beige bg-white/60 p-10 text-center text-coffee">
          No hay productos disponibles en esta categoría por ahora.
        </div>
      )}
    </section>
  );
}
