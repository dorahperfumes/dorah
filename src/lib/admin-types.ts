export type AdminCategory = "arabes" | "disenador" | "accesorios" | "decants";

export interface SimpleAdminProduct {
  id: string;
  nombre: string;
  marca: string;
  precio: string;
  desc: string;
  disponible: boolean;
  img: string | null;
}

export interface DecantAdminProduct {
  id: string;
  nombre: string;
  marca: string;
  precio5: string;
  precio10: string;
  disp5: boolean;
  disp10: boolean;
  img: string | null;
}
