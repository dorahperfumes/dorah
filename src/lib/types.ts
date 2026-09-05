export type Category = "arabes" | "disenador" | "decants" | "accesorios";
export type Gender = "hombre" | "mujer" | "unisex";

export interface Product {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price?: string;
  price5ml?: string;
  price10ml?: string;
  images?: string[];
  description?: string | null;
  gender?: Gender | null;
}

export interface CartItem {
  key: string;
  name: string;
  brand: string;
  price?: string;
  size?: string;
  category: Category;
  image?: string;
  qty: number;
}
