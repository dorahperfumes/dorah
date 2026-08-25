"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { PHONE } from "@/lib/products";

interface TopbarProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
  menuOpen: boolean;
}

export default function Topbar({ onMenuClick, onLogoClick, menuOpen }: TopbarProps) {
  const { totalQty, openCart } = useCart();

  return (
    <div className="topbar">
      <div className="topbar-side">
        <button
          className={`menu-btn${menuOpen ? " open" : ""}`}
          aria-label="Abrir menú"
          onClick={onMenuClick}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="brand-mini" onClick={onLogoClick} style={{ cursor: "pointer" }}>
          <div className="logo-plaque">
            <Image src="/dorah-logo.png" alt="Dorah" width={140} height={48} priority style={{ height: 48, width: "auto" }} />
          </div>
        </div>
      </div>
      <div className="topbar-side">
        <button className="cart-btn" aria-label="Carrito" onClick={openCart}>
          <svg viewBox="0 0 24 24">
            <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="17" cy="20" r="1" />
          </svg>
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </button>
        <a
          className="wa-top"
          href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hola! Te escribo desde la web de Dorah")}`}
          target="_blank"
          rel="noopener"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
