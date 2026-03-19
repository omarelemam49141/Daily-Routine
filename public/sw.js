/* Minimal offline shell — safe fallback */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("hygiene-v1").then((cache) => cache.addAll(["/"])),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/") || fetch(event.request)),
    );
  }
});
