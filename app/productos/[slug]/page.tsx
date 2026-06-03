import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";
import { getProductBySlug } from "@/lib/db/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
