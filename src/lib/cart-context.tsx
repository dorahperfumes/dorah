"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CartItem, Category } from "./types";
import { PHONE } from "./products";

const STORAGE_KEY = "dorah-cart-v2";

interface CartContextValue {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (key: string) => void;
  incrementItem: (key: string) => void;
  decrementItem: (key: string) => void;
  setItemQty: (key: string, qty: number) => void;
  clearCart: () => void;
  totalQty: number;
  subtotal: number;
  hasUnknownPrices: boolean;
  waLink: string;
}

const CartContext = createContext<CartContextValue | null>(null);

function priceNumber(price?: string) {
  const value = Number(price);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function money(value: number) {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.key === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.brand === "string" &&
        typeof candidate.category === "string" &&
        typeof candidate.qty === "number"
      );
    })
    .map((item) => ({
      ...item,
      qty: Math.min(99, Math.max(1, Math.floor(item.qty))),
    }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Conserva el pedido aunque el cliente cambie de sección o abra una ficha.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCart(normalizeStoredCart(JSON.parse(saved)));
      }
    } catch (error) {
      console.warn("No se pudo recuperar el carrito de Dorah:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn("No se pudo guardar el carrito de Dorah:", error);
    }
  }, [cart, hydrated]);

  function addItem(item: Omit<CartItem, "qty">) {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.key === item.key);

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.key === item.key
            ? {
                ...cartItem,
                ...item,
                qty: Math.min(99, cartItem.qty + 1),
              }
            : cartItem
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeItem(key: string) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function incrementItem(key: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, qty: Math.min(99, item.qty + 1) } : item
      )
    );
  }

  function decrementItem(key: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, qty: Math.max(1, item.qty - 1) } : item
      )
    );
  }

  function setItemQty(key: string, qty: number) {
    const normalized = Math.floor(qty);

    if (!Number.isFinite(normalized)) return;
    if (normalized <= 0) {
      removeItem(key);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, qty: Math.min(99, Math.max(1, normalized)) }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalQty = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const unitPrice = priceNumber(item.price);
        return unitPrice == null ? total : total + unitPrice * item.qty;
      }, 0),
    [cart]
  );

  const hasUnknownPrices = useMemo(
    () => cart.some((item) => priceNumber(item.price) == null),
    [cart]
  );

  const waLink = useMemo(() => {
    if (cart.length === 0) return "#";

    const lines = [
      "Hola Dorah 👋 Quiero consultar este pedido:",
      "",
      ...cart.map((item) => {
        const unitPrice = priceNumber(item.price);
        const detail = item.size ? ` (${item.size})` : "";
        const brand = item.brand ? ` — ${item.brand}` : "";
        const itemTotal = unitPrice == null
          ? "precio a confirmar"
          : money(unitPrice * item.qty);

        return `• ${item.name}${detail}${brand} × ${item.qty} — ${itemTotal}`;
      }),
      "",
    ];

    if (subtotal > 0) {
      lines.push(
        hasUnknownPrices
          ? `Subtotal de productos con precio: ${money(subtotal)}`
          : `Total estimado: ${money(subtotal)}`
      );
    }

    if (hasUnknownPrices) {
      lines.push("Hay productos con precio a confirmar.");
    }

    lines.push("", "¿Me confirman disponibilidad y total final?");

    return `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [cart, subtotal, hasUnknownPrices]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        setItemQty,
        clearCart,
        totalQty,
        subtotal,
        hasUnknownPrices,
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
