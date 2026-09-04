import type { MetadataRoute } from "next";
import { fetchAllPublicProductsServer } from "@/lib/products-public-server";

const SITE_URL = "https://dorah-murex.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllPublicProductsServer();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/perfumes/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
