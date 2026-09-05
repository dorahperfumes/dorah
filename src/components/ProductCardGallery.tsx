"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./CatalogSections.module.css";

export default function ProductCardGallery({
  images,
  alt,
  placeholder,
}: {
  images?: string[] | null;
  alt: string;
  placeholder: React.ReactNode;
}) {
  const safeImages = (images ?? []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const hasImages = safeImages.length > 0;
  const hasMultiple = safeImages.length > 1;

  function next() {
    if (!hasMultiple) return;
    setIndex((current) => (current + 1) % safeImages.length);
  }

  function previous() {
    if (!hasMultiple) return;
    setIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
  }

  function onTouchStart(event: React.TouchEvent<HTMLButtonElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    suppressClick.current = false;
  }

  function onTouchEnd(event: React.TouchEvent<HTMLButtonElement>) {
    if (touchStartX.current == null || !hasMultiple) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 35) return;

    suppressClick.current = true;
    if (delta < 0) next();
    else previous();

    window.setTimeout(() => {
      suppressClick.current = false;
    }, 250);
  }

  if (!hasImages) {
    return (
      <div className={styles.galleryPlaceholder}>
        {placeholder}
        <span>Foto a cargar</span>
      </div>
    );
  }

  return (
    <div className={styles.cardGallery}>
      <button
        type="button"
        className={styles.galleryMain}
        aria-label={
          hasMultiple
            ? `Cambiar foto de ${alt}. Foto ${index + 1} de ${safeImages.length}`
            : `Foto de ${alt}`
        }
        onClick={() => {
          if (suppressClick.current) return;
          next();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={safeImages[index]}
          alt={`${alt} — foto ${index + 1}`}
          fill
          sizes="(max-width: 560px) calc(100vw - 78px), (max-width: 900px) 42vw, 320px"
          className={styles.galleryImage}
        />

        {hasMultiple && (
          <>
            <span className={styles.galleryCounter}>
              {index + 1}/{safeImages.length}
            </span>
            <span className={styles.galleryTapHint}>Tocá para cambiar</span>
          </>
        )}
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
            onClick={previous}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
            onClick={next}
            aria-label="Foto siguiente"
          >
            ›
          </button>

          <div className={styles.galleryDots} aria-hidden="true">
            {safeImages.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={dotIndex === index ? styles.galleryDotActive : styles.galleryDot}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
