export default function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Dorah Perfumes & Accesorios",
    "url": "https://www.dorah.com.ar",
    "image": "https://www.dorah.com.ar/dorah-logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Resistencia",
      "addressRegion": "Chaco",
      "addressCountry": "AR"
    },
    "priceRange": "$$"
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
