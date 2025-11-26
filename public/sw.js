// public/sw.js
// Service Worker para Jujuy Conecta PWA
// Enfocado en:
// - Mantener la app instalable
// - Cachear estáticos e imágenes
// - NO romper Next.js cacheando el HTML de "/"

const STATIC_CACHE = "jujuy-conecta-static-v2";
const DYNAMIC_CACHE = "jujuy-conecta-dynamic-v1";

const STATIC_ASSETS = [
  "/manifest.json",
  "/jc.ico",
  "/jc.png",
  "/og-diario.jpg", // si no existe, podés quitarlo
];

// Install: precache de assets estáticos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activar el SW nuevo inmediatamente
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

// Estrategias de cache:
// - Navegación (HTML): red directa a la red (no cacheamos el HTML de Next)
// - Assets de Next: /_next/static -> cache-first
// - Imágenes: cache-first
// - Otros GET: network-first con fallback a cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // No tocamos nada que no sea GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegaciones (páginas HTML): red directa, sin cache de HTML
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  // 2) Assets estáticos de Next (JS/CSS) -> cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request)
            .then((response) => {
              // Clonamos y guardamos en cache
              cache.put(request, response.clone());
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
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached || Promise.reject());
        })
      )
    );
    return;
  }

  // 4) Otros GET -> network-first con fallback a cache dinámico
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
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
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          // Si ya hay una pestaña abierta, la enfocamos
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Si no, abrimos una nueva
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  }
});
