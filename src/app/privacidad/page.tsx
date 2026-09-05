import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Dorah Perfumes & Accesorios.",
};

export default function PrivacidadPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Volver a Dorah</Link>
        <p className={styles.eyebrow}>Información legal</p>
        <h1 className={styles.title}>Política de privacidad</h1>
        <p className={styles.updated}>Última actualización: septiembre de 2026</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Alcance</h2>
            <p>
              Esta política explica de forma general cómo se trata la información relacionada con
              el uso de la tienda online de Dorah Perfumes & Accesorios.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Datos de clientes</h2>
            <p>
              La tienda no requiere crear una cuenta para navegar o armar un pedido. Los datos que
              el cliente decida compartir al comunicarse por WhatsApp se utilizan para responder la
              consulta, confirmar disponibilidad y coordinar la compra o entrega.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Pagos</h2>
            <p>
              Actualmente el sitio no procesa pagos en línea ni solicita cargar datos de tarjetas.
              Las condiciones de pago se coordinan directamente con Dorah.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Servicios técnicos</h2>
            <p>
              Para operar la página se utilizan servicios de infraestructura y alojamiento web que
              pueden procesar información técnica necesaria para brindar y proteger el servicio,
              conforme a sus propias políticas y medidas de seguridad.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Consultas sobre privacidad</h2>
            <p>
              Para realizar una consulta vinculada con tus datos o con esta política, podés
              comunicarte directamente con Dorah mediante WhatsApp.
            </p>
          </section>
        </div>

        <p className={styles.note}>
          Esta política deberá revisarse si en el futuro se incorporan pagos online, cuentas de
          clientes, formularios, analítica avanzada u otros servicios que impliquen nuevos
          tratamientos de datos.
        </p>
      </div>
    </main>
  );
}
