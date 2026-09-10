import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  fetchPublicProductByIdServer,
  publicProductImages,
} from "@/lib/products-public-server";

const SITE_URL = "https://www.dorah.com.ar";

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

  const productUrl = `${SITE_URL}/perfumes/${product.id}`;
  const numericPrice = Number(product.price);
  const hasValidOffer = Number.isFinite(numericPrice) && numericPrice > 0;
  const hasProductImage = images.length > 0;

  // Google exige un precio mayor que cero para Merchant listings. Los productos
  // marcados como "Consultar por WhatsApp" no deben publicar un Offer ficticio
  // con precio 0 ni reseñas inventadas. En esos casos usamos WebPage +
  // BreadcrumbList y reservamos Product + Offer para productos con precio real.
  const mainEntity = hasValidOffer && hasProductImage
    ? {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description,
        image: images,
        url: productUrl,
        category,
        sku: String(product.id),
        ...(brand
          ? {
              brand: {
                "@type": "Brand",
                name: brand,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "ARS",
          price: numericPrice,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "Dorah Perfumes & Accesorios",
            url: SITE_URL,
          },
        },
        ...(gender
          ? {
              audience: {
                "@type": "PeopleAudience",
                suggestedGender: gender,
              },
            }
          : {}),
      }
    : {
        "@type": "WebPage",
        "@id": `${productUrl}#webpage`,
        url: productUrl,
        name: product.name,
        description,
        ...(images[0] ? { primaryImageOfPage: images[0] } : {}),
      };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      mainEntity,
      {
        "@type": "BreadcrumbList",
        "@id": `${productUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: category,
            item: `${SITE_URL}/?section=${product.category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
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
