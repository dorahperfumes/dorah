import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de Dorah Perfumes & Accesorios.",
};

export default function TerminosPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Volver a Dorah</Link>
        <p className={styles.eyebrow}>Información legal</p>
        <h1 className={styles.title}>Términos y condiciones</h1>
        <p className={styles.updated}>Última actualización: septiembre de 2026</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Información general</h2>
            <p>
              Este sitio presenta el catálogo de Dorah Perfumes & Accesorios. Las consultas,
              confirmaciones de disponibilidad y coordinación de pedidos se realizan directamente
              con Dorah, principalmente por WhatsApp.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Productos, precios y disponibilidad</h2>
            <p>
              La disponibilidad puede variar. El precio y stock definitivos son los informados al
              momento de confirmar el pedido. Cuando un producto figure sin precio, su valor será
              informado antes de concretar la operación.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Pedidos y pagos</h2>
            <p>
              La web permite armar una selección y enviarla por WhatsApp. Actualmente Dorah no
              realiza el cobro dentro de este sitio; la modalidad de pago se acuerda con el cliente
              antes de confirmar la compra.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Entregas y envíos</h2>
            <p>
              Las opciones, costos y plazos de entrega o envío se informan según el destino y se
              confirman con el cliente antes de finalizar el pedido.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Cambios, devoluciones y normativa aplicable</h2>
            <p>
              Los cambios y devoluciones se gestionan de acuerdo con las condiciones informadas por
              Dorah y la normativa argentina de defensa del consumidor que resulte aplicable.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Contacto</h2>
            <p>
              Para consultas sobre un pedido o estas condiciones, podés comunicarte con Dorah por
              WhatsApp desde los accesos disponibles en la tienda.
            </p>
          </section>
        </div>

        <p className={styles.note}>
          Estas condiciones describen el funcionamiento actual de la tienda online y pueden
          actualizarse cuando cambien sus servicios o modalidades de venta.
        </p>
      </div>
    </main>
  );
}
