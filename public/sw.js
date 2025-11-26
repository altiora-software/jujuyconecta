// public/sw.js
// Service Worker para Jujuy Conecta PWA
// Versión SAFE: no toca HTML ni navegaciones, solo estáticos e imágenes

const STATIC_CACHE = "jujuy-conecta-static-v3";
const DYNAMIC_CACHE = "jujuy-conecta-dynamic-v1";

const STATIC_ASSETS = [
  "/manifest.json",
  "/jc.ico",
  "/jc.png",
  "/og-diario.jpg", // sacalo si no existe
];

// Install: precache de assets estáticos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// Activate: limpiar caches viejos
self.addEventListener("activate", (event) => {
  const allowedCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !allowedCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Fetch:
// - NO interceptar navegaciones (HTML) -> dejamos que el navegador haga lo suyo
// - _next/static -> cache-first
// - imágenes -> cache-first
// - otros GET mismos origen -> network-first con fallback a cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegaciones: NO interceptar (evitamos romper Next)
  if (request.mode === "navigate") {
    return;
  }

  // Solo nos metemos con mismo origen
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) {
    return; // no tocamos cosas externas (APIs de terceros, etc.)
  }

  // 2) Assets de Next (JS/CSS estático) -> cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request)
            .then((response) => {
              // solo cacheamos respuestas válidas
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached || Promise.reject());
        })
      )
    );
    return;
  }

  // 3) Imágenes -> cache-first
  if (request.destination === "image") {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached || Promise.reject());
        })
      )
    );
    return;
  }

  // 4) Otros GET mismo origen -> network-first con fallback a cache dinámico
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || Promise.reject())
      )
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/jc.png",
    badge: "/jc.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver más",
        icon: "/jc.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/jc.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === "/" && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
    );
  }
});
