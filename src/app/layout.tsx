import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://dorah-murex.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dorah — Perfumes & Accesorios",
    template: "%s | Dorah",
  },
  description:
    "Perfumes árabes, perfumes de diseñador, decants y accesorios. Consultá disponibilidad y realizá tu pedido por WhatsApp.",
  applicationName: "Dorah",
  keywords: [
    "Dorah",
    "perfumes",
    "perfumes árabes",
    "perfumes de diseñador",
    "decants",
    "perfumería",
    "perfumes Argentina",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Dorah Perfumes & Accesorios",
    title: "Dorah — Perfumes & Accesorios",
    description:
      "Perfumes árabes, de diseñador, decants y accesorios. Pedidos y consultas por WhatsApp.",
    images: [
      {
        url: "/dorah-logo.png",
        alt: "Dorah Perfumes & Accesorios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dorah — Perfumes & Accesorios",
    description:
      "Perfumes árabes, de diseñador, decants y accesorios. Pedidos y consultas por WhatsApp.",
    images: ["/dorah-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6efdf",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
