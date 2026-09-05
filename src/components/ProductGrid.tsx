"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { BottleIcon, RingIcon } from "./icons";
import ProductCardGallery from "./ProductCardGallery";
import { consultStockLink, needsConsult } from "@/lib/whatsapp";
import styles from "./CatalogSections.module.css";

const GENDER_LABELS: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Unisex",
};

const GROUPS = [
  { key: "hombre", title: "Hombre", subtitle: "Perfumes para hombre" },
  { key: "mujer", title: "Mujer", subtitle: "Perfumes para mujer" },
  { key: "unisex", title: "Unisex", subtitle: "Fragancias para todos" },
] as const;

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
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((p) =>
      `${p.name} ${p.brand}`.toLowerCase().includes(normalized)
    );
  }, [products, query]);

  const grouped = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      products: filtered.filter((p) => p.gender === group.key),
    })).filter((group) => group.products.length > 0);
  }, [filtered]);

  const unspecified = useMemo(
    () => filtered.filter((p) => !p.gender),
    [filtered]
  );

  function handleAdd(p: Product) {
    addItem({
      key: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      category: p.category,
      image: p.images?.[0],
    });
    setAddedKey(p.id);
    setTimeout(() => setAddedKey(null), 1200);
  }

  function scrollToGroup(key: string) {
    document.getElementById(`catalog-${key}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function renderCard(p: Product) {
    const consult = needsConsult(p.price);

    return (
      <div className={`card ${styles.productCard}`} key={p.id}>
        <ProductCardGallery
          images={p.images}
          alt={p.name}
          placeholder={isAccesorios ? <RingIcon /> : <BottleIcon />}
        />

        <div className="card-body">
          {p.gender && (
            <span className="gender-tag">{GENDER_LABELS[p.gender]}</span>
          )}
          <span className="brand">{p.brand}</span>
          <h4 className={styles.productTitle}>
            <Link href={`/perfumes/${p.id}`} className={styles.productTitleLink}>
              {p.name}
            </Link>
          </h4>
          <Link href={`/perfumes/${p.id}`} className={styles.detailsLink}>
            Ver ficha completa <span aria-hidden="true">→</span>
          </Link>

          {!consult && (
            <span className="price">{money(p.price)}</span>
          )}

          {consult ? (
            <a
              className="card-cta"
              href={consultStockLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
             
            >
              Consultar por WhatsApp
            </a>
          ) : (
            <button
              className={`card-cta${addedKey === p.id ? " added" : ""}`}
              onClick={() => {
                handleAdd(p);
              }}
            >
              {addedKey === p.id ? "Agregado ✓" : "Agregar al carrito"}
            </button>
          )}
        </div>
      </div>
    );
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
        <svg viewBox="0 0 24 24" aria-hidden="true">
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

      {!isAccesorios && grouped.length > 0 && (
        <div className={styles.quickNav} aria-label="Filtrar por género">
          {grouped.map((group) => (
            <button
              key={group.key}
              type="button"
              className={styles.quickChip}
              onClick={() => scrollToGroup(group.key)}
            >
              <span>{group.title}</span>
              <strong>{group.products.length}</strong>
            </button>
          ))}
        </div>
      )}

      {isAccesorios ? (
        <div className="grid">{filtered.map(renderCard)}</div>
      ) : (
        <div className={styles.groupList}>
          {grouped.map((group) => (
            <section
              key={group.key}
              id={`catalog-${group.key}`}
              className={styles.genderSection}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>COLECCIÓN</span>
                  <h3>{group.title}</h3>
                  <p>{group.subtitle}</p>
                </div>
                <span className={styles.countBadge}>
                  {group.products.length} {group.products.length === 1 ? "producto" : "productos"}
                </span>
              </div>

              <div className="grid">{group.products.map(renderCard)}</div>
            </section>
          ))}

          {unspecified.length > 0 && (
            <section id="catalog-otros" className={styles.genderSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>COLECCIÓN</span>
                  <h3>Otros</h3>
                  <p>Productos todavía sin género asignado</p>
                </div>
                <span className={styles.countBadge}>
                  {unspecified.length} {unspecified.length === 1 ? "producto" : "productos"}
                </span>
              </div>

              <div className="grid">{unspecified.map(renderCard)}</div>
            </section>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="no-results" style={{ display: "block" }}>
          No encontramos productos con ese nombre.
        </div>
      )}
    </section>
  );
}
