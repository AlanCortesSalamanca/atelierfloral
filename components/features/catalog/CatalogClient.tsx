"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/features/catalog/ProductCard";
import { productCategories } from "@/lib/constants/categories";
import type { Product } from "@/lib/types";

export function CatalogClient({ products, initialCategory = "Todos" }: { products: Product[]; initialCategory?: string }) {
  const categories = [...productCategories];
  const normalizedInitialCategory = categories.includes(initialCategory as (typeof categories)[number]) ? initialCategory : "Todos";
  const [selectedCategory, setSelectedCategory] = useState(normalizedInitialCategory);
  const filteredProducts = useMemo(
    () => (selectedCategory === "Todos" ? products : products.filter((product) => product.category === selectedCategory)),
    [products, selectedCategory],
  );

  return (
    <section className="container-page section-pad">
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectedCategory === category ? "bg-ink text-cream shadow-card" : "border border-beige bg-white/60 text-coffee hover:bg-beige/60"
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
