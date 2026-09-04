import { PHONE } from "./products";

/** Link de WhatsApp para consultar disponibilidad/precio de un producto sin precio cargado. */
export function consultStockLink(productName: string, size?: string): string {
  const detail = size ? `${productName} (${size})` : productName;
  const text = `Hola! Quiero consultar disponibilidad y precio de: ${detail}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

/** Un precio "0" o vacío significa que todavía no está cargado: hay que consultar por WhatsApp. */
export function needsConsult(price?: string): boolean {
  return !price || Number(price) === 0;
}
