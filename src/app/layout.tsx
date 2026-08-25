import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dorah — Perfumes & Accesorios",
  description: "Perfumes árabes, de diseñador, decants y accesorios. Pedidos por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
