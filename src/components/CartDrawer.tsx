"use client";

import { useCart } from "@/lib/cart-context";
import { BottleIcon, RingIcon } from "./icons";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, waLink } = useCart();

  return (
    <aside className={`cart-drawer${isOpen ? " open" : ""}`}>
      <div className="cart-head">
        <h3>Tu pedido</h3>
        <button onClick={closeCart} aria-label="Cerrar carrito">
          &times;
        </button>
      </div>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="cart-empty">Todavía no agregaste productos.</div>
        ) : (
          cart.map((c) => (
            <div className="cart-item" key={c.key}>
              <div className="ci-photo">{c.category === "accesorios" ? <RingIcon /> : <BottleIcon />}</div>
              <div className="ci-info">
                <div className="ci-name">
                  {c.name}
                  {c.size ? ` (${c.size})` : ""}
                </div>
                <div className="ci-meta">
                  {c.brand} · Cant: {c.qty}
                </div>
                <button className="ci-remove" onClick={() => removeItem(c.key)}>
                  Quitar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-foot">
        <a className="cart-send" href={waLink} target="_blank" rel="noopener">
          Enviar pedido por WhatsApp
        </a>
        <div className="cart-note">
          Se junta todo en un solo mensaje de WhatsApp. No hay pago online: coordinás con Dorah directamente.
        </div>
      </div>
    </aside>
  );
}
