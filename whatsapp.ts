const WHATSAPP_NUMBER = "5493532400597";

function productUrl(id: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/perfumes/${id}`;
  }
  return `https://www.dorah.com.ar/perfumes/${id}`;
}

function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function consultProductWhatsApp(product: {
  id: string;
  name: string;
  brand?: string | null;
}) {
  const label = product.brand ? `${product.name} de ${product.brand}` : product.name;
  openWhatsApp(
    `Hola, Dorah. Quería consultar por ${label}.\n` +
    `¿Me podrían confirmar el precio y si tienen disponibilidad?\n\n` +
    `Ver producto: ${productUrl(product.id)}\n\n` +
    `¡Gracias!`
  );
}

export function consultDecantWhatsApp(product: {
  id: string;
  name: string;
  brand?: string | null;
}, size: "5ml" | "10ml") {
  const label = product.brand ? `${product.name} de ${product.brand}` : product.name;
  openWhatsApp(
    `Hola, Dorah. Quería consultar por el decant de ${size} de ${label}.\n` +
    `¿Me podrían confirmar el precio y si tienen disponibilidad?\n\n` +
    `Ver producto: ${productUrl(product.id)}?format=decant\n\n` +
    `¡Gracias!`
  );
}

export function consultStockWhatsApp(product: {
  id: string;
  name: string;
  brand?: string | null;
}) {
  const label = product.brand ? `${product.name} de ${product.brand}` : product.name;
  openWhatsApp(
    `Hola, Dorah. Estoy buscando ${label}, pero figura sin disponibilidad en la web.\n` +
    `¿Saben si vuelve a ingresar próximamente?\n\n` +
    `Ver producto: ${productUrl(product.id)}\n\n` +
    `¡Gracias!`
  );
}
