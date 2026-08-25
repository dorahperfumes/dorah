"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Category } from "./types";
import { PHONE } from "./products";

interface CartContextValue {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (key: string) => void;
  totalQty: number;
  waLink: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  function addItem(item: Omit<CartItem, "qty">) {
    setCart((prev) => {
      const existing = prev.find((c) => c.key === item.key);
      if (existing) {
        return prev.map((c) => (c.key === item.key ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeItem(key: string) {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }

  const totalQty = cart.reduce((a, c) => a + c.qty, 0);

  let msg = "Hola! Quiero consultar por estos productos de Dorah:%0A%0A";
  cart.forEach((c) => {
    msg += `• ${c.name}${c.size ? ` (${c.size})` : ""} — Cant: ${c.qty}%0A`;
  });
  msg += "%0A¿Me confirmás disponibilidad?";
  const waLink = cart.length ? `https://wa.me/${PHONE}?text=${msg}` : "#";

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        totalQty,
        waLink,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

export type { Category };
