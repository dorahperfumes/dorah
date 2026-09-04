import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.screen} aria-label="Cargando Dorah">
      <div className={styles.brand}>
        <img
          className={styles.logo}
          src="/dorah-logo.png"
          alt="Dorah Perfumes & Accesorios"
        />
        <div className={styles.line}>
          <span />
        </div>
        <p>PERFUMES & ACCESORIOS</p>
      </div>
    </div>
  );
}
