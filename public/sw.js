// public/sw.js
// Service Worker mínimo para Jujuy Conecta
// - Mantiene la instalación PWA
// - Mantiene notificaciones push
// - NO intercepta fetch, así que no puede romper Next.js

const SW_VERSION = "jc-sw-minimal-v1";

// Install
self.addEventListener("install", (event) => {
  // No precacheamos nada para evitar conflictos
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  // Si en el futuro querés limpiar caches viejos, lo podés hacer acá
  event.waitUntil(self.clients.claim());
});

// IMPORTANTE: NO HAY fetch event
// Eso significa que todas las requests las maneja el navegador normal,
// sin que el SW meta mano. La app funciona igual que sin SW,
// pero seguís teniendo SW para instalación y push.

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
