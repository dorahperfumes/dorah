"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import SiteFooter, { FloatingSocial } from "@/components/SiteFooter";
import { CartProvider, useCart } from "@/lib/cart-context";
import { PHONE } from "@/lib/products";
import {
  dbProductToSiteProduct,
  fetchPublicProductById,
  fetchPublicProducts,
} from "@/lib/products-db";
import type { Product } from "@/lib/types";
import { consultStockLink, needsConsult } from "@/lib/whatsapp";
import styles from "./page.module.css";

const GENDER_LABELS: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Unisex",
};

const CATEGORY_LABELS: Record<string, string> = {
  arabes: "Perfumes Árabes",
  disenador: "Perfumes de Diseñador",
  decants: "Decants",
  accesorios: "Accesorios",
};

function money(value?: string) {
  if (!value || Number(value) === 0) return "Consultar stock";
  return `$ ${Number(value).toLocaleString("es-AR")}`;
}

function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { addItem, totalQty, openCart, isOpen, closeCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<"5ml" | "10ml">("5ml");
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const ignoreClick = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;

      try {
        setLoading(true);
        const row = await fetchPublicProductById(id);

        if (cancelled) return;

        if (!row) {
          setProduct(null);
          setRelated([]);
          return;
        }

        const converted = dbProductToSiteProduct(row);
        setProduct(converted);
        setActiveImage(0);
        document.title = `${converted.name} | Dorah`;

        try {
          const sameCategory = await fetchPublicProducts(row.category);
          if (!cancelled) {
            const candidates = sameCategory.filter((item) => item.id !== row.id);
            const relevant = row.gender
              ? candidates.filter((item) => item.gender === row.gender)
              : candidates;

            setRelated(relevant.slice(0, 4).map(dbProductToSiteProduct));
          }
        } catch (error) {
          console.error("No se pudieron cargar productos relacionados:", error);
          if (!cancelled) setRelated([]);
        }
      } catch (error) {
        console.error("No se pudo cargar el producto:", error);
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(
    () => product?.images?.filter(Boolean) ?? [],
    [product]
  );

  const isDecant = product?.category === "decants";
  const selectedPrice = isDecant
    ? size === "5ml"
      ? product?.price5ml
      : product?.price10ml
    : product?.price;
  const consult = needsConsult(selectedPrice);

  function nextImage() {
    if (images.length < 2) return;
    setActiveImage((current) => (current + 1) % images.length);
  }

  function previousImage() {
    if (images.length < 2) return;
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null || images.length < 2) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 45) return;

    ignoreClick.current = true;
    if (delta < 0) nextImage();
    else previousImage();

    window.setTimeout(() => {
      ignoreClick.current = false;
    }, 250);
  }

  function handleMainImageClick() {
    if (ignoreClick.current) return;
    nextImage();
  }

  function handleAddToCart() {
    if (!product) return;

    addItem({
      key: isDecant ? `${product.id}-${size}` : product.id,
      name: product.name,
      brand: product.brand,
      price: selectedPrice,
      size: isDecant ? size : undefined,
      category: product.category,
      image: product.images?.[0],
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  async function handleShare() {
    if (!product) return;

    const url = window.location.href;
    const text = `Mirá ${product.name} en Dorah`;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1400);
    } catch {
      // El usuario puede cancelar el diálogo de compartir.
    }
  }

  if (loading) {
    return (
      <main className={styles.loading}>
        <img src="/dorah-logo.png" alt="Dorah" />
        <span>Cargando producto...</span>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.notFound}>
        <img src="/dorah-logo.png" alt="Dorah" />
        <span>PRODUCTO NO DISPONIBLE</span>
        <h1>Este producto no está disponible actualmente.</h1>
        <p>Puede estar pausado, eliminado o fuera del catálogo.</p>
        <Link href="/">VOLVER A DORAH</Link>
      </main>
    );
  }

  const whatsappHref = consultStockLink(product.name, isDecant ? size : undefined);
  const relatedGridClass =
    related.length === 1
      ? `${styles.relatedGrid} ${styles.relatedGridOne}`
      : related.length === 2
        ? `${styles.relatedGrid} ${styles.relatedGridTwo}`
        : related.length === 3
          ? `${styles.relatedGrid} ${styles.relatedGridThree}`
          : `${styles.relatedGrid} ${styles.relatedGridFour}`;

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Volver a Dorah">
          <img src="/dorah-logo.png" alt="Dorah" />
        </Link>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.cartButton}
            onClick={openCart}
            aria-label="Abrir carrito"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
            {totalQty > 0 && <span>{totalQty}</span>}
          </button>

          <a
            className={styles.whatsappHeader}
            href={`https://wa.me/${PHONE}?text=${encodeURIComponent(
              "Hola! Te escribo desde la web de Dorah"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WHATSAPP
          </a>
        </div>
      </header>

      <div className={`overlay${isOpen ? " show" : ""}`} onClick={closeCart} />
      <CartDrawer />

      <main className={styles.page}>
        <div className={styles.topNavigation}>
          <button type="button" className={styles.backButton} onClick={() => router.back()}>
            <span aria-hidden="true">←</span> VOLVER
          </button>

          <nav className={styles.breadcrumb} aria-label="Migas de pan">
            <Link href="/">Dorah</Link>
            <span>/</span>
            <span>{CATEGORY_LABELS[product.category] ?? "Productos"}</span>
            <span>/</span>
            <strong>{product.name}</strong>
          </nav>
        </div>

        <section className={styles.productLayout}>
          <div className={styles.galleryColumn}>
            <div
              className={styles.mainImage}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={images.length > 1 ? styles.photoClickArea : styles.photoStatic}
                role={images.length > 1 ? "button" : undefined}
                tabIndex={images.length > 1 ? 0 : undefined}
                onClick={images.length > 1 ? handleMainImageClick : undefined}
                onKeyDown={(event) => {
                  if (images.length > 1 && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    nextImage();
                  }
                }}
                aria-label={images.length > 1 ? "Ver la siguiente foto" : undefined}
              >
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={`${product.name} - foto ${activeImage + 1}`}
                  />
                ) : (
                  <div className={styles.noPhoto}>
                    <svg viewBox="0 0 100 160" aria-hidden="true">
                      <rect x="28" y="35" width="44" height="95" rx="8" />
                      <rect x="38" y="18" width="24" height="18" rx="3" />
                      <path d="M50 65l12 12-12 12-12-12z" />
                    </svg>
                    <span>Foto a cargar</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      previousImage();
                    }}
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>

                  <span className={styles.imageCounter}>
                    {activeImage + 1}/{images.length}
                  </span>
                  <span className={styles.nextPhotoHint}>Clic o deslizá para cambiar la foto</span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={activeImage === index ? styles.activeThumb : ""}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoColumn}>
            {product.gender && (
              <span className={styles.genderPill}>{GENDER_LABELS[product.gender]}</span>
            )}

            <span className={styles.brand}>{product.brand}</span>
            <h1>{product.name}</h1>

            <div className={styles.rule} />

            {isDecant && (
              <div className={styles.sizeBlock}>
                <span className={styles.label}>ELEGÍ EL TAMAÑO</span>
                <div className={styles.sizeButtons}>
                  <button
                    type="button"
                    className={size === "5ml" ? styles.activeSize : ""}
                    onClick={() => setSize("5ml")}
                  >
                    5 ML
                  </button>
                  <button
                    type="button"
                    className={size === "10ml" ? styles.activeSize : ""}
                    onClick={() => setSize("10ml")}
                  >
                    10 ML
                  </button>
                </div>
              </div>
            )}

            {!consult && (
              <div className={styles.price}>{money(selectedPrice)}</div>
            )}

            {product.description && (
              <div className={styles.description}>{product.description}</div>
            )}

            <div className={styles.availabilityNote}>
              <span className={styles.availabilityDot} aria-hidden="true" />
              <div>
                <strong>Disponibilidad sujeta a stock</strong>
                <span>Consultá y te confirmamos en minutos por WhatsApp.</span>
              </div>
            </div>

            {consult ? (
              <a
                className={styles.primaryAction}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                CONSULTAR POR WHATSAPP
              </a>
            ) : (
              <button
                type="button"
                className={`${styles.primaryAction} ${added ? styles.added : ""}`}
                onClick={handleAddToCart}
              >
                {added ? "AGREGADO ✓" : "AGREGAR AL CARRITO"}
              </button>
            )}

            <div className={styles.trustGrid}>
              <div>
                <strong>100% originales</strong>
                <span>Productos seleccionados</span>
              </div>
              <div>
                <strong>Envíos</strong>
                <span>Coordinamos tu entrega</span>
              </div>
              <div>
                <strong>Atención directa</strong>
                <span>Te asesoramos por WhatsApp</span>
              </div>
            </div>

            <p className={styles.paymentNote}>
              El pago y el envío se coordinan por WhatsApp una vez armado tu pedido en el carrito.
            </p>

            <button type="button" className={styles.shareButton} onClick={handleShare}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8l7.5-4.4M8.2 13.2l7.5 4.4" />
              </svg>
              {shared ? "LINK COPIADO ✓" : "COMPARTIR PRODUCTO"}
            </button>
          </div>
        </section>

        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedHeading}>
              <span>TAMBIÉN TE PUEDE GUSTAR</span>
              <h2>Descubrí otras opciones</h2>
            </div>

            <div className={relatedGridClass}>
              {related.map((item) => {
                const image = item.images?.[0];
                const relatedPrice = item.category === "decants" ? item.price5ml : item.price;
                const relatedConsult = needsConsult(relatedPrice);

                return (
                  <Link key={item.id} href={`/perfumes/${item.id}`} className={styles.relatedCard}>
                    <div className={styles.relatedImage}>
                      {image ? (
                        <img src={image} alt={item.name} />
                      ) : (
                        <div className={styles.relatedPlaceholder}>DORAH</div>
                      )}
                    </div>
                    <span>{item.brand}</span>
                    <h3>{item.name}</h3>
                    {!relatedConsult && <p>{money(relatedPrice)}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <div className={styles.mobileActionBar}>
        <div>
          <span>{consult ? "DISPONIBILIDAD" : "PRECIO"}</span>
          <strong>{consult ? "Por WhatsApp" : money(selectedPrice)}</strong>
        </div>
        {consult ? (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            WHATSAPP
          </a>
        ) : (
          <button type="button" onClick={handleAddToCart}>
            {added ? "AGREGADO ✓" : "AGREGAR"}
          </button>
        )}
      </div>

      <SiteFooter />
      <FloatingSocial />
    </>
  );
}

export default function PerfumePage() {
  return (
    <CartProvider>
      <ProductDetailPage />
    </CartProvider>
  );
}
