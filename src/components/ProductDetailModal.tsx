"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { consultStockLink, needsConsult } from "@/lib/whatsapp";

const GENDER_LABELS: Record<string, string> = {
  hombre: "Para hombre",
  mujer: "Para mujer",
  unisex: "Unisex",
};

function money(n?: string) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <line x1="8.3" y1="10.7" x2="15.7" y2="6.3" />
      <line x1="8.3" y1="13.3" x2="15.7" y2="17.7" />
    </svg>
  );
}

export default function ProductDetailModal({
  product,
  isDecant,
  onClose,
  onAddToCart,
}: {
  product: Product;
  isDecant?: boolean;
  onClose: () => void;
  onAddToCart: (size?: "5ml" | "10ml") => void;
}) {
  const images = product.images && product.images.length ? product.images : [];
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<"5ml" | "10ml">("5ml");

  function nextImage() {
    if (images.length > 1) setActiveImg((i) => (i + 1) % images.length);
  }

  async function handleShare() {
    const text = `Mirá "${product.name}" en Dorah — Perfumes & Accesorios`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch {
        /* el usuario canceló, no hacemos nada */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} — ${url}`);
        alert("Copiado. Ya podés pegarlo en WhatsApp, Instagram, etc.");
      } catch {
        alert("No se pudo copiar automáticamente. Compartí el link de la página.");
      }
    }
  }

  return (
    <>
      <div
        className="detail-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="detail-modal">
          <button className="detail-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
          <div
            className="detail-gallery-main"
            onClick={nextImage}
          >
            {images.length ? (
              <img src={images[activeImg]} alt={product.name} />
            ) : (
              <span style={{ color: "#b3a58a", fontSize: "0.8rem" }}>Foto a cargar</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((img, i) => (
                <button
                  key={img}
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="detail-body">
            <div className="detail-brand">{product.brand}</div>
            <h3 className="detail-name">{product.name}</h3>
            {product.gender && <span className="gender-tag">{GENDER_LABELS[product.gender]}</span>}
            {product.description && <p className="detail-desc">{product.description}</p>}

            {isDecant ? (
              <>
                <div className="size-toggle">
                  <button className={size === "5ml" ? "active" : ""} onClick={() => setSize("5ml")}>
                    5ml
                  </button>
                  <button className={size === "10ml" ? "active" : ""} onClick={() => setSize("10ml")}>
                    10ml
                  </button>
                </div>
                {needsConsult(size === "5ml" ? product.price5ml : product.price10ml) ? (
                  <a
                    className="detail-price consult-link"
                    href={consultStockLink(product.name, size)}
                  >
                    Consultar stock
                  </a>
                ) : (
                  <div className="detail-price">{money(size === "5ml" ? product.price5ml : product.price10ml)}</div>
                )}
              </>
            ) : needsConsult(product.price) ? (
              <a className="detail-price consult-link" href={consultStockLink(product.name)}>
                Consultar stock
              </a>
            ) : (
              <div className="detail-price">{money(product.price)}</div>
            )}

            <div className="detail-actions">
              {(isDecant ? needsConsult(size === "5ml" ? product.price5ml : product.price10ml) : needsConsult(product.price)) ? (
                <a
                  className="detail-cta"
                  href={consultStockLink(product.name, isDecant ? size : undefined)}
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  Consultar por WhatsApp
                </a>
              ) : (
                <button className="detail-cta" onClick={() => onAddToCart(isDecant ? size : undefined)}>
                  Agregar al carrito
                </button>
              )}
              <button className="detail-share" onClick={handleShare}>
                <ShareIcon /> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
