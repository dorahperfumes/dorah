import { createClient } from "@supabase/supabase-js";

// Si todavía no cargaste las variables de entorno (.env.local o en Vercel),
// usamos valores de relleno para que el sitio compile y se muestre igual
// con los productos de ejemplo. Las llamadas reales a Supabase van a fallar
// silenciosamente hasta que cargues las credenciales verdaderas.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
