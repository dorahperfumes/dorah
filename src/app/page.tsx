"use client";

import { useState } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import Topbar from "@/components/Topbar";
import Drawer from "@/components/Drawer";
import CartDrawer from "@/components/CartDrawer";
import HomePage from "@/components/HomePage";
import ProductGrid from "@/components/ProductGrid";
import DecantGrid from "@/components/DecantGrid";
import SiteFooter, { FloatingSocial } from "@/components/SiteFooter";
import { PageId } from "@/components/PageShell";
import { arabes, disenador, decants, accesorios } from "@/lib/products";

function Overlay({ show, onClick }: { show: boolean; onClick: () => void }) {
  return <div className={`overlay${show ? " show" : ""}`} onClick={onClick}></div>;
}

function DorahApp() {
  const [page, setPage] = useState<PageId>("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen: cartOpen, closeCart } = useCart();

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
