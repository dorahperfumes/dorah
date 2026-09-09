export function ProductSchema(props: {
  name: string;
  image?: string;
  description?: string;
  price?: number | string;
  id?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: props.name,
    image: props.image ? [props.image] : [],
    description: props.description || "",
    brand: {
      "@type": "Brand",
      name: "Dorah",
    },
    ...(props.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: props.price,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
