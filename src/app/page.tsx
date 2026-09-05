"use client";

import { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import Topbar from "@/components/Topbar";
import Drawer from "@/components/Drawer";
import CartDrawer from "@/components/CartDrawer";
import HomePage from "@/components/HomePage";
import ProductGrid from "@/components/ProductGrid";
import DecantGrid from "@/components/DecantGrid";
import SiteFooter, { FloatingSocial } from "@/components/SiteFooter";
import type { PageId } from "@/components/PageShell";
import type { Product } from "@/lib/types";
import { fetchPublicProducts, dbProductToSiteProduct } from "@/lib/products-db";

const VALID_PAGES: PageId[] = [
  "inicio",
  "arabes",
  "disenador",
  "decants",
  "accesorios",
];

const VALID_GENDERS = new Set(["hombre", "mujer", "unisex", "otros"]);

function Overlay({ show, onClick }: { show: boolean; onClick: () => void }) {
  return <div className={`overlay${show ? " show" : ""}`} onClick={onClick}></div>;
}

function DorahApp() {
  const [page, setPage] = useState<PageId>("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen: cartOpen, closeCart } = useCart();

  const [arabes, setArabes] = useState<Product[]>([]);
  const [disenador, setDisenador] = useState<Product[]>([]);
  const [decants, setDecants] = useState<Product[]>([]);
  const [accesorios, setAccesorios] = useState<Product[]>([]);

  useEffect(() => {
    // Si venimos desde la ficha de un producto, recuperamos la categoría anterior.
    const params = new URLSearchParams(window.location.search);
    const requestedSection = params.get("section") as PageId | null;
    const requestedGender = params.get("gender");

    if (requestedSection && VALID_PAGES.includes(requestedSection)) {
      setPage(requestedSection);
    }

    if (requestedGender && VALID_GENDERS.has(requestedGender)) {
      let attempts = 0;
      let timer: number | undefined;

      const scrollToPreviousGroup = () => {
        const target = document.getElementById(`catalog-${requestedGender}`);

        if (target) {
          target.scrollIntoView({ block: "start", behavior: "auto" });
          return;
        }

        attempts += 1;
        if (attempts < 30) {
          timer = window.setTimeout(scrollToPreviousGroup, 100);
        }
      };

      timer = window.setTimeout(scrollToPreviousGroup, 80);

      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    // Catálogo público: solamente productos activos cargados en Supabase.
    (async () => {
      try {
        const [a, d, dc, ac] = await Promise.all([
          fetchPublicProducts("arabes"),
          fetchPublicProducts("disenador"),
          fetchPublicProducts("decants"),
          fetchPublicProducts("accesorios"),
        ]);

        setArabes(a.map(dbProductToSiteProduct));
        setDisenador(d.map(dbProductToSiteProduct));
        setDecants(dc.map(dbProductToSiteProduct));
        setAccesorios(ac.map(dbProductToSiteProduct));
      } catch (err) {
        console.error("No se pudieron cargar los productos de Supabase.", err);
      }
    })();
  }, []);

  function goTo(p: PageId) {
    setPage(p);
    setDrawerOpen(false);

    // La categoría queda reflejada en la URL. Así, al volver desde una ficha,
    // Dorah sabe exactamente qué sección debe mostrar.
    const nextUrl = p === "inicio" ? "/" : `/?section=${p}`;
    window.history.replaceState(window.history.state, "", nextUrl);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeAll() {
    setDrawerOpen(false);
    closeCart();
  }

  return (
    <>
      <Topbar
        onMenuClick={() => setDrawerOpen((o) => !o)}
        onLogoClick={() => goTo("inicio")}
        menuOpen={drawerOpen}
      />
      <Overlay show={drawerOpen || cartOpen} onClick={closeAll} />
      <Drawer open={drawerOpen} activePage={page} onNavigate={goTo} />
      <CartDrawer />

      {page === "inicio" && <HomePage onNavigate={goTo} />}
      {page === "arabes" && (
        <ProductGrid
          title="Perfumes Árabes"
          eyebrow="Colección 01"
          description="Fragancias orientales de alta concentración, ideales para quienes buscan una estela intensa y duradera."
          products={arabes}
          searchPlaceholder="Buscar en Perfumes Árabes..."
        />
      )}
      {page === "disenador" && (
        <ProductGrid
          title="Perfumes de Diseñador"
          eyebrow="Colección 02"
          description="Casas de moda y perfumería internacional, siempre originales y con garantía de procedencia."
          products={disenador}
          searchPlaceholder="Buscar en Perfumes de Diseñador..."
        />
      )}
      {page === "decants" && <DecantGrid products={decants} />}
      {page === "accesorios" && (
        <ProductGrid
          title="Accesorios"
          eyebrow="Colección 03"
          description="Anillos, pulseras y detalles pensados para combinar con tu fragancia favorita."
          products={accesorios}
          searchPlaceholder="Buscar en Accesorios..."
          isAccesorios
        />
      )}

      <SiteFooter />
      <FloatingSocial />
    </>
  );
}

export default function Page() {
  return (
    <CartProvider>
      <DorahApp />
    </CartProvider>
  );
}
