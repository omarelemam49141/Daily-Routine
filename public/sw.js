/* Minimal PWA — avoid serving the app shell for every URL (breaks /login hydration). */
const CACHE = "hygiene-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      const scope = self.registration.scope;
      return cache.addAll([scope]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  // Always hit network for HTML navigations so each route gets correct HTML (static export).
  // Do NOT fall back to registration.scope — that was serving / for /login and could freeze the UI.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
