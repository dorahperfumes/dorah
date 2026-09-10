type ProductSchemaProps = {
  name: string;
  description?: string;
  image?: string[];
  price?: string;
  brand?: string;
  url: string;
};

export default function ProductSchema(props: ProductSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: props.name,
    description: props.description,
    image: props.image,
    url: props.url,
    ...(props.brand
      ? { brand: { "@type": "Brand", name: props.brand } }
      : {}),
    ...(props.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: props.price,
            availability: "https://schema.org/InStock",
            url: props.url,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
