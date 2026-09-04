import { supabase } from "./supabase";
import { processImageFile } from "./image-utils";

export type DBCategory = "arabes" | "disenador" | "accesorios" | "decants";
export type Gender = "hombre" | "mujer" | "unisex";

export interface DBProduct {
  id: string;
  category: DBCategory;
  brand: string | null;
  name: string;
  price: number | null;
  price_5ml: number | null;
  price_10ml: number | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  gender: Gender | null;
  active: boolean;
  active_5ml: boolean;
  active_10ml: boolean;
  created_at: string;
}

/** Sube una foto ya procesada (redimensionada/orientada) y devuelve su URL pública. */
export async function uploadProductPhoto(file: File): Promise<string> {
  const processed = await processImageFile(file);
  const fileName = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("product-images").upload(fileName, processed, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

/** Sube hasta 3 fotos en orden y devuelve sus URLs públicas. */
export async function uploadProductPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files.slice(0, 3)) {
    urls.push(await uploadProductPhoto(file));
  }
  return urls;
}

/** Productos activos de una categoría, para el sitio público. */
export async function fetchPublicProducts(category: DBCategory): Promise<DBProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as DBProduct[];
}

/** Todos los productos de una categoría (activos y pausados), para el admin. */
export async function fetchAdminProducts(category: DBCategory): Promise<DBProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DBProduct[];
}

export async function insertProduct(payload: Partial<DBProduct>): Promise<DBProduct> {
  const { data, error } = await supabase.from("products").insert(payload).select().single();
  if (error) throw error;
  return data as DBProduct;
}

export async function updateProduct(id: string, payload: Partial<DBProduct>): Promise<void> {
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/** Convierte un producto de Supabase al formato que usan los componentes del sitio público. */
export function dbProductToSiteProduct(p: DBProduct): {
  id: string;
  category: DBCategory;
  brand: string;
  name: string;
  price?: string;
  price5ml?: string;
  price10ml?: string;
  images: string[];
  description?: string | null;
  gender?: Gender | null;
} {
  const images = p.image_urls && p.image_urls.length ? p.image_urls : p.image_url ? [p.image_url] : [];
  return {
    id: p.id,
    category: p.category,
    brand: p.brand || "",
    name: p.name,
    price: p.price != null ? String(p.price) : undefined,
    price5ml: p.price_5ml != null ? String(p.price_5ml) : undefined,
    price10ml: p.price_10ml != null ? String(p.price_10ml) : undefined,
    images,
    description: p.description,
    gender: p.gender,
  };
}
