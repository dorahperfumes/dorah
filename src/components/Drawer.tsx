"use client";

import Image from "next/image";
import { PageId } from "./PageShell";

interface DrawerProps {
  open: boolean;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const LINKS: { id: PageId; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "arabes", label: "Perfumes Árabes" },
  { id: "disenador", label: "Perfumes de Diseñador" },
  { id: "decants", label: "Decants" },
  { id: "accesorios", label: "Accesorios" },
];

export default function Drawer({ open, activePage, onNavigate }: DrawerProps) {
  return (
    <aside className={`drawer${open ? " open" : ""}`}>
      <div className="logo-plaque">
        <Image src="/dorah-logo.png" alt="Dorah" width={210} height={72} className="drawer-logo" />
      </div>
      <div className="drawer-tag">Perfumes &amp; Accesorios</div>
      <nav>
        {LINKS.map((link) => (
          <a
            key={link.id}
            href="#"
            className={activePage === link.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.id);
            }}
          >
            <span className="diamond"></span> {link.label}
          </a>
        ))}
      </nav>
      <div className="drawer-footer">
        <a href="https://www.instagram.com/dorah.accesorios/" target="_blank" rel="noopener">
          Instagram →
        </a>
        <a href="https://www.tiktok.com/@dorahaccesorios?_r=1&_t=ZS-999vy8eGjvI" target="_blank" rel="noopener">
          TikTok →
        </a>
        <div className="addr">
          📍 Necochea 330 · Resistencia, Chaco
          <br />
          🚚 Envíos a todo el país
        </div>
      </div>
    </aside>
  );
}
