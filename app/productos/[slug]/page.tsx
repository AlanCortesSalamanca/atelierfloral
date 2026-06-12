import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";
import { getProductBySlug } from "@/lib/db/products";
import { siteConfig } from "@/lib/config";
import { siteContent } from "@/lib/constants/site";

type ProductPageProps = { params: Promise<{ slug: string }> };

function productDescription(product: { name: string; category: string; description: string | null }) {
  return product.description || `${product.name} de ${siteContent.name}. Producto artesanal de la categoría ${product.category} para regalos, eventos y cotizaciones personalizadas.`;
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no disponible",
      robots: { index: false, follow: false },
    };
  }

  const description = productDescription(product);
  const images = product.image ? [{ url: product.image, alt: product.name }] : undefined;

  return {
    title: `${product.name} | ${product.category} artesanal`,
    description,
    keywords: [product.name, product.category, "velas artesanales", "suculentas", "flores de vela", "plantas de regalo", "recuerdos personalizados"],
    alternates: {
      canonical: `/productos/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${siteContent.name}`,
      description,
      url: `/productos/${product.slug}`,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteContent.name}`,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    image: [product.image, ...(product.gallery_images ?? [])].filter(Boolean),
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteContent.name,
    },
    url: `${siteConfig.siteUrl}/productos/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price ?? 0,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.siteUrl}/productos/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <ProductDetailClient product={product} />
    </>
  );
}
