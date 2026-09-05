"use client";

import Image from "next/image";
import { PHONE } from "@/lib/products";
import { PageId } from "./PageShell";
import styles from "./HomePage.module.css";

const TILES: { page: PageId; number: string; eyebrow: string; title: string; desc: string }[] = [
  {
    page: "arabes",
    number: "01",
    eyebrow: "Colección",
    title: "Perfumes Árabes",
    desc: "Esencias intensas, elegantes y de gran duración.",
  },
  {
    page: "disenador",
    number: "02",
    eyebrow: "Colección",
    title: "Perfumes de Diseñador",
    desc: "Fragancias reconocidas para todos los estilos.",
  },
  {
    page: "decants",
    number: "03",
    eyebrow: "Descubrí",
    title: "Decants",
    desc: "Probá nuevas fragancias en formatos prácticos.",
  },
  {
    page: "accesorios",
    number: "04",
    eyebrow: "Completá tu estilo",
    title: "Accesorios",
    desc: "Detalles seleccionados para acompañarte todos los días.",
  },
];

export default function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const waText = encodeURIComponent("Hola Dorah 👋 Quiero conocer sus perfumes y consultar disponibilidad.");

  function scrollToCollections() {
    document.getElementById("colecciones-dorah")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Perfumería · Resistencia, Chaco</span>

            <Image
              src="/dorah-logo.png"
              alt="Dorah Perfumes & Accesorios"
              width={540}
              height={190}
              priority
              className={styles.heroLogo}
              sizes="(max-width: 700px) 76vw, 470px"
            />

            <p className={styles.heroPhrase}>Detalles que hablan de vos</p>

            <h1 className={styles.heroTitle}>
              Encontrá una fragancia
              <span> que se sienta tuya.</span>
            </h1>

            <p className={styles.heroLead}>
              Perfumes árabes, de diseñador, decants y accesorios seleccionados
              para descubrir, probar y elegir a tu ritmo.
            </p>

            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={scrollToCollections}>
                Explorar colecciones
                <span aria-hidden="true">↓</span>
              </button>

              <a
                className={styles.secondaryButton}
                href={`https://wa.me/${PHONE}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
              </a>
            </div>

            <div className={styles.heroTrust}>
              <span>Perfumes originales</span>
              <i />
              <span>Probadores disponibles</span>
              <i />
              <span>Atención personalizada</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.photoFrame}>
              <Image
                src="/local-dorah.jpg"
                alt="Local de Dorah en Resistencia, Chaco"
                fill
                priority
                className={styles.storePhoto}
                sizes="(max-width: 900px) 92vw, 46vw"
              />
              <div className={styles.photoShade} />
              <div className={styles.photoLabel}>
                <span>Visitá nuestro local</span>
                <strong>Necochea 330</strong>
                <small>Resistencia · Chaco</small>
              </div>
            </div>
</div>
        </div>

        <button
          type="button"
          className={styles.scrollCue}
          onClick={scrollToCollections}
          aria-label="Ver colecciones"
        >
          <span>Descubrir</span>
          <i>↓</i>
        </button>
      </section>

      <section id="colecciones-dorah" className={styles.collections}>
        <div className={styles.collectionsIntro}>
          <span className={styles.sectionKicker}>Universo Dorah</span>
          <h2>Nuestras colecciones</h2>
          <p>
            Encontrá tu próxima fragancia por estilo, categoría y personalidad.
          </p>
        </div>

        <div className={styles.collectionGrid}>
          {TILES.map((tile, index) => (
            <button
              type="button"
              className={styles.collectionCard}
              key={tile.page}
              onClick={() => onNavigate(tile.page)}
            >
              <span className={styles.cardNumber}>{tile.number}</span>

              <div className={styles.cardTopLine}>
                <span className={styles.cardMiniLabel}>
                  {index < 2 ? "Perfumería" : index === 2 ? "Descubrimiento" : "Estilo"}
                </span>
                <span className={styles.cardArrow} aria-hidden="true">↗</span>
              </div>

              <div className={styles.cardContent}>
                <small>{tile.eyebrow}</small>
                <h3>{tile.title}</h3>
                <p>{tile.desc}</p>
              </div>

              <span className={styles.cardCta}>Explorar colección</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.aboutIntro}>
          <span className={styles.sectionKicker}>Quiénes somos</span>
          <h2>Una experiencia pensada para elegir sin apuro.</h2>
        </div>

        <div className={styles.aboutColumns}>
          <p>
            En Dorah vas a encontrar perfumes árabes y de diseñador, además de
            probadores para conocer la fragancia antes de elegirla.
          </p>
          <p>
            También contamos con decants y una selección de accesorios,
            incorporando nuevas opciones y tendencias constantemente.
          </p>
          <p>
            Podés consultarnos disponibilidad y armar tu pedido directamente
            por WhatsApp con una atención personalizada.
          </p>
        </div>

        <div className={styles.aboutFooter}>
          <span>📍 Necochea 330 · Resistencia, Chaco</span>
          <span>📱 +54 9 362 410-7224</span>
          <span>📲 @dorah.accesorios</span>
        </div>
      </section>
    </main>
  );
}
