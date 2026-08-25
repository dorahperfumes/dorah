export type Category = "arabes" | "disenador" | "decants" | "accesorios";

export interface Product {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price?: string;
  price5ml?: string;
  price10ml?: string;
}

export interface CartItem {
  key: string;
  name: string;
  brand: string;
  price?: string;
  size?: string;
  category: Category;
  qty: number;
}
