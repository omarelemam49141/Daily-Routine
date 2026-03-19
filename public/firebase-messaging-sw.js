/* Placeholder: add FCM bootstrap here when NEXT_PUBLIC_FIREBASE_* and VAPID are configured.
 * See: https://firebase.google.com/docs/cloud-messaging/js/client
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
