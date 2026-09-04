"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { BottleIcon, PlaceholderPhoto } from "./icons";
import { consultStockLink, needsConsult } from "@/lib/whatsapp";

const GENDER_LABELS: Record<string, string> = {
  hombre: "Para hombre",
  mujer: "Para mujer",
  unisex: "Unisex",
};

function money(n?: string) {
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

function openProduct(id: string) {
  window.open(`/perfumes/${id}`, "_blank", "noopener,noreferrer");
}

export default function DecantGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [sizes, setSizes] = useState<Record<string, "5" | "10">>({});
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const { addItem } = useCart();

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [products, query]
  );

  function sizeFor(id: string) {
    return sizes[id] ?? "5";
  }

  function handleAdd(p: Product) {
    const size = sizeFor(p.id);
    const price = size === "5" ? p.price5ml : p.price10ml;
    const key = `${p.id}-${size}ml`;

    addItem({
      key,
      name: p.name,
      brand: p.brand,
      price,
      size: `${size}ml`,
      category: "decants",
    });

    setAddedKey(key);
    setTimeout(() => setAddedKey(null), 1200);
  }

  return (
    <section className="page">
      <div className="cat-header">
        <span className="eyebrow">Formato especial</span>
        <div className="divider left" style={{ maxWidth: 120 }}></div>
        <h2>Decants</h2>
        <p>
          La misma fragancia, en frascos de 5ml o 10ml. Ideal para probar antes de invertir en el frasco completo.
        </p>
      </div>

      <div className="search-row">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar en Decants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid">
        {filtered.map((p) => {
          const size = sizeFor(p.id);
          const price = size === "5" ? p.price5ml : p.price10ml;
          const cartKey = `${p.id}-${size}ml`;
          const consult = needsConsult(price);

          return (
            <div
              className="card"
              key={p.id}
              role="link"
              tabIndex={0}
              aria-label={`Abrir ${p.name} en una pestaña nueva`}
              onClick={() => openProduct(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProduct(p.id);
                }
              }}
            >
              <PlaceholderPhoto icon={<BottleIcon />} images={p.images} alt={p.name} />

              <div className="card-body">
                {p.gender && <span className="gender-tag">{GENDER_LABELS[p.gender]}</span>}
                <span className="brand">{p.brand}</span>
                <h4>{p.name}</h4>

                <div className="size-toggle" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={size === "5" ? "active" : ""}
                    onClick={() => setSizes((s) => ({ ...s, [p.id]: "5" }))}
                  >
                    5ml
                  </button>
                  <button
                    className={size === "10" ? "active" : ""}
                    onClick={() => setSizes((s) => ({ ...s, [p.id]: "10" }))}
                  >
                    10ml
                  </button>
                </div>

                {consult ? (
                  <a
                    className="price size-price consult-link"
                    href={consultStockLink(p.name, `${size}ml`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Consultar stock
                  </a>
                ) : (
                  <span className="price size-price">{money(price)}</span>
                )}

                {consult ? (
                  <a
                    className="card-cta"
                    href={consultStockLink(p.name, `${size}ml`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Consultar por WhatsApp
                  </a>
                ) : (
                  <button
                    className={`card-cta${addedKey === cartKey ? " added" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(p);
                    }}
                  >
                    {addedKey === cartKey ? "Agregado ✓" : "Agregar al carrito"}
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
    </section>
  );
}
