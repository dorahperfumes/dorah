"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { BottleIcon, RingIcon } from "./icons";
import styles from "./CartDrawer.module.css";

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

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    totalQty,
    subtotal,
    hasUnknownPrices,
    waLink,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <aside
      className={`${styles.drawer}${isOpen ? ` ${styles.open}` : ""}`}
      aria-hidden={!isOpen}
      aria-label="Carrito de Dorah"
    >
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>TU SELECCIÓN</span>
          <h3>Tu pedido</h3>
          <p>
            {totalQty === 0
              ? "Todavía no agregaste productos"
              : `${totalQty} ${totalQty === 1 ? "producto" : "productos"}`}
          </p>
        </div>

        <button
          type="button"
          className={styles.close}
          onClick={closeCart}
          aria-label="Cerrar carrito"
        >
          ×
        </button>
      </div>

      <div className={styles.items}>
        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <BottleIcon />
            </div>
            <strong>Tu carrito está vacío</strong>
            <p>
              Elegí tus perfumes o decants y armamos el pedido juntos por
              WhatsApp.
            </p>
            <button type="button" onClick={closeCart}>
              SEGUIR EXPLORANDO
            </button>
          </div>
        ) : (
          cart.map((item) => {
            const unitPrice = priceNumber(item.price);
            const lineTotal = unitPrice == null ? null : unitPrice * item.qty;

            return (
              <article className={styles.item} key={item.key}>
                <div className={styles.photo}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="82px"
                      style={{ objectFit: "contain", padding: "5px" }}
                    />
                  ) : item.category === "accesorios" ? (
                    <RingIcon />
                  ) : (
                    <BottleIcon />
                  )}
                </div>

                <div className={styles.itemInfo}>
                  <span className={styles.brand}>{item.brand}</span>
                  <h4>{item.name}</h4>
                  {item.size && <span className={styles.size}>{item.size}</span>}

                  <div className={styles.priceRow}>
                    <span>
                      {unitPrice == null
                        ? "Precio a confirmar"
                        : `${money(unitPrice)} c/u`}
                    </span>
                    {lineTotal != null && <strong>{money(lineTotal)}</strong>}
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantity} aria-label="Cantidad">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.key)}
                        disabled={item.qty <= 1}
                        aria-label={`Restar una unidad de ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.key)}
                        disabled={item.qty >= 99}
                        aria-label={`Agregar una unidad de ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeItem(item.key)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className={styles.foot}>
        {cart.length > 0 && (
          <>
            <div className={styles.summaryLine}>
              <span>Productos</span>
              <strong>{totalQty}</strong>
            </div>

            {subtotal > 0 && (
              <div className={`${styles.summaryLine} ${styles.total}`}>
                <span>{hasUnknownPrices ? "Subtotal conocido" : "Total estimado"}</span>
                <strong>{money(subtotal)}</strong>
              </div>
            )}

            {hasUnknownPrices && (
              <div className={styles.stockNote}>
                Algunos precios se confirman por WhatsApp antes de cerrar el pedido.
              </div>
            )}

            <a
              className={styles.send}
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>ENVIAR PEDIDO POR WHATSAPP</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.7 9.7 0 0 1-3.8-.9L3 20.5l1.5-5A8.4 8.4 0 1 1 21 11.5Z" />
                <path d="M8.2 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.6 1.1 1.5 2 2.6 2.6.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .4-.2 1.3-.7 1.8-.5.5-1.2.8-2 .8-.6 0-1.3-.2-2.1-.5-1.3-.5-2.7-1.4-3.9-2.6-1-1-1.8-2.1-2.3-3.2-.4-.8-.6-1.6-.6-2.2 0-.7.2-1.3.8-1.9Z" />
              </svg>
            </a>

            <button type="button" className={styles.clear} onClick={clearCart}>
              Vaciar carrito
            </button>
          </>
        )}

        <p className={styles.note}>
          No se cobra online. Dorah confirma disponibilidad, total y entrega
          directamente por WhatsApp.
        </p>
      </div>
    </aside>
  );
}
