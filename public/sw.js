/**
 * Self-cleaning Service Worker for ssb.cogify.me
 * Purges legacy caches so updates and browser refreshes always load fresh content immediately.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => {
          // Notify active tabs that legacy cache has been cleared
          client.postMessage({ type: "SW_CACHE_CLEARED" });
        });
      })
  );
});
