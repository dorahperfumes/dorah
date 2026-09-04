/**
 * Procesa una foto subida por el usuario para que se vea bien organizada
 * en cualquier dispositivo (celulares con fotos de altísima resolución,
 * orientación incorrecta, etc.) antes de subirla a Supabase Storage.
 *
 * - Corrige automáticamente la orientación EXIF (fotos de iPhone/Android
 *   que a veces se ven rotadas).
 * - Redimensiona al máximo indicado, manteniendo la proporción original.
 * - Comprime a JPEG para que pese poco y cargue rápido en 3G/4G.
 */
export async function processImageFile(file: File, maxSize = 1200): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let { width, height } = bitmap;
  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen en este navegador.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen final."))),
      "image/jpeg",
      0.85
    );
  });

  return blob;
}

/** Devuelve una URL local temporal para previsualizar antes de subir. */
export function previewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
