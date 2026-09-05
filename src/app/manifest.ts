import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Dorah — Perfumes & Accesorios",
    short_name: "Dorah",
    description:
      "Perfumes árabes, perfumes de diseñador, decants y accesorios.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6efdf",
    theme_color: "#f6efdf",
    lang: "es-AR",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
