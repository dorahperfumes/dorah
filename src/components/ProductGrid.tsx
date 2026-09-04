"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { BottleIcon, RingIcon, PlaceholderPhoto } from "./icons";
import ProductDetailModal from "./ProductDetailModal";
import { consultStockLink, needsConsult } from "@/lib/whatsapp";

const GENDER_LABELS: Record<string, string> = {
  hombre: "Para hombre",
  mujer: "Para mujer",
  unisex: "Unisex",
};

function money(n?: string) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

export default function ProductGrid({
  title,
  eyebrow,
  description,
  products,
  searchPlaceholder,
  isAccesorios = false,
}: {
  title: string;
  eyebrow: string;
  description: string;
  products: Product[];
  searchPlaceholder: string;
  isAccesorios?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [products, query]
  );

  function handleAdd(p: Product) {
    addItem({ key: p.id, name: p.name, brand: p.brand, price: p.price, category: p.category });
    setAddedKey(p.id);
    setTimeout(() => setAddedKey(null), 1200);
  }

  return (
    <section className="page">
      <div className="cat-header">
        <span className="eyebrow">{eyebrow}</span>
        <div className="divider left" style={{ maxWidth: 120 }}></div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="search-row">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid">
        {filtered.map((p) => {
          const consult = needsConsult(p.price);
          return (
            <div className="card" key={p.id} onClick={() => setDetailProduct(p)}>
              <PlaceholderPhoto icon={isAccesorios ? <RingIcon /> : <BottleIcon />} images={p.images} alt={p.name} />
              <div className="card-body">
                {p.gender && <span className="gender-tag">{GENDER_LABELS[p.gender]}</span>}
                <span className="brand">{p.brand}</span>
                <h4>{p.name}</h4>
                {consult ? (
                  <a
                    className="price consult-link"
                    href={consultStockLink(p.name)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Consultar stock
                  </a>
                ) : (
                  <span className="price">{money(p.price)}</span>
                )}
                {consult ? (
                  <a
                    className="card-cta"
                    href={consultStockLink(p.name)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Consultar por WhatsApp
                  </a>
                ) : (
                  <button
                    className={`card-cta${addedKey === p.id ? " added" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(p);
                    }}
                  >
                    {addedKey === p.id ? "Agregado ✓" : "Agregar al carrito"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="no-results" style={{ display: "block" }}>
          No encontramos productos con ese nombre.
        </div>
      )}

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={() => {
            handleAdd(detailProduct);
            setDetailProduct(null);
          }}
        />
      )}
    </section>
  );
}
