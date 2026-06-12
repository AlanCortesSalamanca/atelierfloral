import type { Metadata } from "next";
import { CatalogClient } from "@/components/features/catalog/CatalogClient";
import { getActiveProducts } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Catálogo de velas, suculentas y recuerdos personalizados",
  description: "Explora velas artesanales, suculentas, plantas de regalo, flores de vela, recuerdos para eventos y kits personalizados de Atelier Floral.",
  keywords: ["velas artesanales", "suculentas", "plantas de regalo", "flores de vela", "recuerdos personalizados", "detalles para eventos"],
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo de velas, suculentas y recuerdos personalizados",
    description: "Velas artesanales, suculentas, plantas de regalo, flores de vela y recuerdos personalizados para eventos.",
    url: "/catalogo",
    type: "website",
  },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const products = await getActiveProducts();

  return (
    <main>
      <section className="container-page pt-12">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Catálogo</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Productos para cotizar</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-coffee">
          Selecciona tus velas, suculentas, recuerdos, kits o productos personalizados. Cada tarjeta te lleva al detalle del producto y también puedes agregarlo directo a tu cotización.
        </p>
      </section>
      <CatalogClient products={products} initialCategory={categoria} />
    </main>
  );
}
