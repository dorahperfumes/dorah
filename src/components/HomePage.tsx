"use client";

import Image from "next/image";
import { PageId } from "./PageShell";

const TILES: { page: PageId; eyebrow: string; title: string; desc: string }[] = [
  { page: "arabes", eyebrow: "Colección", title: "Perfumes Árabes", desc: "Esencias intensas y de larga duración." },
  { page: "disenador", eyebrow: "Colección", title: "Perfumes de Diseñador", desc: "Firmas reconocidas, 100% originales." },
  { page: "decants", eyebrow: "Formato", title: "Decants", desc: "Probá tu favorita en 5ml o 10ml." },
  { page: "accesorios", eyebrow: "Colección", title: "Accesorios", desc: "Anillos, pulseras y detalles que combinan." },
];

export default function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <section className="page">
      <div className="hero">
        <div className="logo-plaque">
          <Image
            src="/dorah-logo.png"
            alt="Dorah"
            width={620}
            height={210}
            priority
            className="logo-hero"
            style={{ width: "min(620px, 88vw)", height: "auto" }}
          />
        </div>
        <div className="eyebrow">Perfumes árabes · Perfumes de diseñador · Decants · Accesorios</div>
        <p className="lead">
          Fragancias seleccionadas para quienes eligen distinguirse. Consultá disponibilidad y armá tu pedido
          directo por WhatsApp.
        </p>

        <div className="cat-tiles">
          {TILES.map((t) => (
            <div
              className="cat-tile"
              key={t.page}
              onClick={() => onNavigate(t.page)}
              style={{ cursor: "pointer" }}
            >
              <span className="eyebrow">{t.eyebrow}</span>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about">
        <div className="about-photo">
          <Image src="/local-dorah.jpg" alt="Local de Dorah — Necochea 330, Resistencia" width={640} height={800} style={{ width: "100%", height: "auto" }} />
        </div>
        <div className="about-text">
          <span className="eyebrow">Quiénes somos</span>
          <h2>Dorah</h2>
          <p>
            Somos una empresa dedicada a la venta y comercialización de perfumes y accesorios, ofreciendo productos
            seleccionados para quienes buscan calidad, variedad y una atención personalizada.
          </p>
          <p>
            En nuestra sección de perfumería contamos con una amplia variedad de perfumes árabes y perfumes de
            diseñador originales, pensados para diferentes gustos y estilos. Además, contamos con probadores, para
            que puedas conocer y probar las fragancias antes de elegir tu perfume.
          </p>
          <p>
            También ofrecemos decants, una excelente opción para descubrir nuevas fragancias, probarlas durante
            varios días o llevar tus perfumes favoritos en un formato práctico.
          </p>
          <p>
            Pero nuestra propuesta no termina en la perfumería. En nuestra sección de accesorios vas a encontrar
            una amplia variedad de productos para complementar tu estilo, como cadenas, pulseras, collares,
            pañuelos, billeteras, carteras y mucho más, incorporando constantemente opciones de temporada y nuevas
            tendencias.
          </p>
          <p>
            Contamos con múltiples medios de pago: efectivo, transferencia bancaria, tarjetas de crédito hasta 3
            cuotas sin interés y créditos personales.
          </p>
          <div className="addr-block">
            <div className="addr-line">
              📍 <span>Encontranos en <b>Necochea 330</b>, Resistencia, Chaco</span>
            </div>
            <div className="addr-line">
              📱 <span>3624 10 72 24</span>
            </div>
            <div className="addr-line">
              📲 <span>Seguinos en nuestras redes: @dorah.accesorios</span>
            </div>
          </div>
          <div className="tagline">Dorah — Detalles que hablan de vos</div>
        </div>
      </div>
    </section>
  );
}
