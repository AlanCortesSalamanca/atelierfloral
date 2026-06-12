import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getActiveProducts } from "@/lib/db/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;
  const products = await getActiveProducts();

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/catalogo`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/cotizacion`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/aviso-de-privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...products.map((product) => ({
      url: `${baseUrl}/productos/${product.slug}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
