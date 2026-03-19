/* Minimal offline shell — works at repo root and under GitHub Pages base path */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("hygiene-v1").then((cache) => {
      const scope = self.registration.scope;
      return cache.addAll([scope]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    const scope = self.registration.scope;
    event.respondWith(
      fetch(event.request).catch(
        () => caches.match(scope) || caches.match(event.request) || fetch(event.request),
      ),
    );
  }
});
