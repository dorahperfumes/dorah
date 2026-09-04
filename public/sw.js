const VERSION = "dorah-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/*
  Dorah usa Supabase para el catálogo. Para evitar mostrar stock o información
  desactualizada, el Service Worker NO cachea las consultas ni las páginas.
  Su función es permitir la experiencia instalable tipo app sin alterar la
  lógica online de la tienda.
*/
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(fetch(request));
});
