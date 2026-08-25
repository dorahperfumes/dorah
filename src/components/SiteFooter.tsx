import { PHONE } from "@/lib/products";

export default function SiteFooter() {
  return (
    <footer>
      <div>© 2026 Dorah — Perfumes & Accesorios</div>
      <div className="foot-addr">
        📍 Necochea 330 · Resistencia, Chaco
        <br />
        🚚 Envíos a todo el país
      </div>
      <div>
        <a href="https://www.instagram.com/dorah.accesorios/" target="_blank" rel="noopener">
          Instagram
        </a>
        &nbsp;·&nbsp;
        <a href="https://www.tiktok.com/@dorahaccesorios?_r=1&_t=ZS-999vy8eGjvI" target="_blank" rel="noopener">
          TikTok
        </a>
        &nbsp;·&nbsp;
        <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener">
          WhatsApp
        </a>
      </div>
    </footer>
  );
}

export function FloatingSocial() {
  const waText = encodeURIComponent("Hola! Te escribo desde la web de Dorah");
  return (
    <div className="float-social">
      <a
        className="fs-whatsapp"
        href={`https://wa.me/${PHONE}?text=${waText}`}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24">
          <path d="M17.6 6.32A8.9 8.9 0 0 0 12.05 4c-4.86 0-8.82 3.96-8.82 8.82 0 1.56.41 3.08 1.19 4.42L3.16 21l3.86-1.24a8.9 8.9 0 0 0 4.99 1.5h.01c4.86 0 8.82-3.96 8.82-8.82a8.9 8.9 0 0 0-2.24-6.12zm-5.55 13.5h-.01c-1.56 0-3.08-.42-4.4-1.21l-.32-.19-3.27 1.05 1.06-3.2-.2-.32a7.3 7.3 0 0 1-1.13-3.93c0-4.03 3.29-7.32 7.34-7.32a7.28 7.28 0 0 1 7.32 7.33c0 4.03-3.29 7.32-7.34 7.32zm4.03-5.49c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11s-.57.72-.7.87c-.13.14-.26.16-.48.05-.22-.11-.92-.34-1.75-1.09-.65-.58-1.08-1.29-1.21-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.14.04-.27-.02-.38-.06-.11-.5-1.22-.7-1.66-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.38.05-.58.27-.2.22-.76.74-.76 1.81s.78 2.1.89 2.24c.11.14 1.53 2.34 3.7 3.28.52.22.92.36 1.24.46.52.16.99.14 1.36.09.42-.06 1.3-.53 1.48-1.05.18-.51.18-.95.13-1.05-.05-.09-.2-.15-.42-.26z" />
        </svg>
      </a>
      <a
        className="fs-instagram"
        href="https://www.instagram.com/dorah.accesorios/"
        target="_blank"
        rel="noopener"
        aria-label="Instagram"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44.54c.64-.25 1.37-.42 2.43-.47C8.94.02 9.28.01 12 .01zm0 5.35A4.64 4.64 0 1 0 12 16.63 4.64 4.64 0 0 0 12 7.35zm0 7.65a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.84a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0z" />
        </svg>
      </a>
      <a
        className="fs-tiktok"
        href="https://www.tiktok.com/@dorahaccesorios?_r=1&_t=ZS-999vy8eGjvI"
        target="_blank"
        rel="noopener"
        aria-label="TikTok"
      >
        <svg viewBox="0 0 24 24">
          <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4V15.4a5.4 5.4 0 1 1-4.65-5.35v2.5a2.9 2.9 0 1 0 2.05 2.77V2h2.6a4.28 4.28 0 0 0 3.14 3.82z" />
        </svg>
      </a>
    </div>
  );
}
