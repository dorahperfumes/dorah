import type { Metadata, Viewport } from "next";
import PWARegister from "@/components/PWARegister";
import "./globals.css";
import "./color-lock.css";

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
  manifest: "/manifest.webmanifest",
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
  appleWebApp: {
    capable: true,
    title: "Dorah",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6efdf",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR">
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
