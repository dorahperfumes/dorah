import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://www.dorah.com.ar";

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("perfumes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return { title: "Producto no encontrado | Dorah" };
  }

  return {
    title: `${product.name} | Dorah Perfumes`,
    description: product.description || `Comprá ${product.name} en Dorah Perfumes.`,
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : [],
    description: product.description || "",
    brand: {
      "@type": "Brand",
      name: "Dorah",
    },
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: product.price,
            availability: product.stock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/perfumes/${product.id}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      {children}
    </>
  );
}
