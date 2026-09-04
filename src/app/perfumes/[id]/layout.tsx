import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  fetchPublicProductByIdServer,
  publicProductImages,
} from "@/lib/products-public-server";

const SITE_URL = "https://dorah-murex.vercel.app";

const CATEGORY_LABELS: Record<string, string> = {
  arabes: "Perfumes Árabes",
  disenador: "Perfumes de Diseñador",
  decants: "Decants",
  accesorios: "Accesorios",
};

const GENDER_LABELS: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Unisex",
};

function cleanDescription(value: string | null | undefined, fallback: string) {
  const text = (value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchPublicProductByIdServer(id);

  if (!product) {
    return {
      title: { absolute: "Producto no disponible | Dorah" },
      description: "Este producto no está disponible actualmente en Dorah.",
      robots: { index: false, follow: false },
    };
  }

  const brand = product.brand?.trim();
  const brandSuffix =
    brand && !product.name.toLowerCase().includes(brand.toLowerCase())
      ? ` de ${brand}`
      : "";
  const fallbackDescription = `${product.name}${brandSuffix} en Dorah Perfumes & Accesorios. Consultá disponibilidad y realizá tu pedido por WhatsApp.`;
  const description = cleanDescription(product.description, fallbackDescription);
  const images = publicProductImages(product);
  const image = images[0] || "/dorah-logo.png";
  const canonical = `/perfumes/${product.id}`;
  const title = `${product.name}${brand ? ` — ${brand}` : ""} | Dorah`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Dorah Perfumes & Accesorios",
      locale: "es_AR",
      type: "website",
      images: [
        {
          url: image,
          alt: `${product.name}${brand ? ` - ${brand}` : ""}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductSeoLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchPublicProductByIdServer(id);

  if (!product) return children;

  const images = publicProductImages(product);
  const brand = product.brand?.trim();
  const category = CATEGORY_LABELS[product.category] ?? "Perfumes y accesorios";
  const gender = product.gender ? GENDER_LABELS[product.gender] : undefined;
  const description = cleanDescription(
    product.description,
    `${product.name}${brand ? ` de ${brand}` : ""} disponible en Dorah.`
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: images,
    url: `${SITE_URL}/perfumes/${product.id}`,
    category,
    ...(brand
      ? {
          brand: {
            "@type": "Brand",
            name: brand,
          },
        }
      : {}),
    ...(gender ? { audience: { "@type": "PeopleAudience", suggestedGender: gender } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
