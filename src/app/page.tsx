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
import { PageId } from "@/components/PageShell";
import { arabes as demoArabes, disenador as demoDisenador, decants as demoDecants, accesorios as demoAccesorios } from "@/lib/products";
import { Product } from "@/lib/types";
import { fetchPublicProducts, dbProductToSiteProduct } from "@/lib/products-db";

function Overlay({ show, onClick }: { show: boolean; onClick: () => void }) {
  return <div className={`overlay${show ? " show" : ""}`} onClick={onClick}></div>;
}

function DorahApp() {
  const [page, setPage] = useState<PageId>("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen: cartOpen, closeCart } = useCart();

  const [arabes, setArabes] = useState<Product[]>(demoArabes);
  const [disenador, setDisenador] = useState<Product[]>(demoDisenador);
  const [decants, setDecants] = useState<Product[]>(demoDecants);
  const [accesorios, setAccesorios] = useState<Product[]>(demoAccesorios);

  useEffect(() => {
    // Trae los productos reales cargados desde el panel de admin (Supabase).
    // Si una categoría todavía no tiene productos cargados, se mantienen
    // los de ejemplo para que la sección nunca se vea vacía.
    (async () => {
      try {
        const [a, d, dc, ac] = await Promise.all([
          fetchPublicProducts("arabes"),
          fetchPublicProducts("disenador"),
          fetchPublicProducts("decants"),
          fetchPublicProducts("accesorios"),
        ]);
        if (a.length) setArabes(a.map(dbProductToSiteProduct));
        if (d.length) setDisenador(d.map(dbProductToSiteProduct));
        if (dc.length) setDecants(dc.map(dbProductToSiteProduct));
        if (ac.length) setAccesorios(ac.map(dbProductToSiteProduct));
      } catch (err) {
        console.error("No se pudieron cargar los productos de Supabase, se muestran los de ejemplo.", err);
      }
    })();
  }, []);

  function goTo(p: PageId) {
    setPage(p);
    setDrawerOpen(false);
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
