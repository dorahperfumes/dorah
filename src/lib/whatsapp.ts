const WHATSAPP_NUMBER = "5493532400597";

export function needsConsult(
  value: number | string | null | undefined
) {
  if (value == null || value === "") return true;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) || numericValue === 0;
}

function productUrl(id: string, decant = false) {
  return `https://www.dorah.com.ar/perfumes/${id}${decant ? "?format=decant" : ""}`;
}

function whatsappHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Compatibilidad con los componentes existentes.
 * Se mantiene para no romper imports anteriores.
 */
export function consultStockLink(name: string, size?: string) {
  const subject = size ? `el decant de ${size} de ${name}` : name;
  return whatsappHref(
    `Hola, Dorah. Quería consultar por ${subject}.\n` +
      `¿Me podrían confirmar el precio y si tienen disponibilidad?\n\n` +
      `¡Gracias!`
  );
}


export function consultProductLink(product: {
  id: string;
  name: string;
  brand?: string | null;
}) {
  const label = product.brand
    ? `${product.name} de ${product.brand}`
    : product.name;

  return whatsappHref(
    `Hola, Dorah. Quería consultar por ${label}.\n` +
      `¿Me podrían confirmar el precio y si tienen disponibilidad?\n\n` +
      `Ver producto: ${productUrl(product.id)}\n\n` +
      `¡Gracias!`
  );
}

export function consultDecantLink(
  product: {
    id: string;
    name: string;
    brand?: string | null;
  },
  size: "5ml" | "10ml"
) {
  const label = product.brand
    ? `${product.name} de ${product.brand}`
    : product.name;

  return whatsappHref(
    `Hola, Dorah. Quería consultar por el decant de ${size} de ${label}.\n` +
      `¿Me podrían confirmar el precio y si tienen disponibilidad?\n\n` +
      `Ver producto: ${productUrl(product.id, true)}\n\n` +
      `¡Gracias!`
  );
}

export function consultProductWhatsApp(product: {
  id: string;
  name: string;
  brand?: string | null;
}) {
  window.open(consultProductLink(product), "_blank", "noopener,noreferrer");
}

export function consultDecantWhatsApp(
  product: {
    id: string;
    name: string;
    brand?: string | null;
  },
  size: "5ml" | "10ml"
) {
  window.open(consultDecantLink(product, size), "_blank", "noopener,noreferrer");
}

export function consultStockWhatsApp(product: {
  id: string;
  name: string;
  brand?: string | null;
}) {
  const label = product.brand
    ? `${product.name} de ${product.brand}`
    : product.name;

  window.open(
    whatsappHref(
      `Hola, Dorah. Estoy buscando ${label}, pero figura sin disponibilidad en la web.\n` +
        `¿Saben si vuelve a ingresar próximamente?\n\n` +
        `Ver producto: ${productUrl(product.id)}\n\n` +
        `¡Gracias!`
    ),
    "_blank",
    "noopener,noreferrer"
  );
}
