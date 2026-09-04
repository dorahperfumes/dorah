import { createClient } from "@supabase/supabase-js";

export type PublicProductCategory =
  | "arabes"
  | "disenador"
  | "accesorios"
  | "decants";

export type PublicProductGender = "hombre" | "mujer" | "unisex";

export interface PublicProductRow {
  id: string;
  category: PublicProductCategory;
  brand: string | null;
  name: string;
  price: number | null;
  price_5ml: number | null;
  price_10ml: number | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  gender: PublicProductGender | null;
  active: boolean;
  active_5ml: boolean;
  active_10ml: boolean;
  created_at: string;
}

function getPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Lee un producto activo usando únicamente la clave pública + RLS. */
export async function fetchPublicProductByIdServer(
  id: string
): Promise<PublicProductRow | null> {
  const supabase = getPublicServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("SEO: no se pudo cargar el producto", error.message);
    return null;
  }

  return data as PublicProductRow | null;
}

/** Lee todos los productos activos para sitemap.xml. */
export async function fetchAllPublicProductsServer(): Promise<PublicProductRow[]> {
  const supabase = getPublicServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SEO: no se pudo generar el catálogo público", error.message);
    return [];
  }

  return (data ?? []) as PublicProductRow[];
}

export function publicProductImages(product: PublicProductRow): string[] {
  if (product.image_urls?.length) return product.image_urls.filter(Boolean);
  return product.image_url ? [product.image_url] : [];
}
