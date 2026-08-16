const CACHE_NAME = "operio-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache each resource independently — cache.addAll() is all-or-nothing,
      // so one failed fetch (e.g. a transient CDN hiccup) would previously
      // abort the whole install and leave the offline fallback uncached.
      Promise.allSettled([
        cache.add(OFFLINE_URL),
        cache.add("/manifest.json"),
        cache.add("/icon.svg"),
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Network-first for navigations, falling back to a cached offline page —
// but only when the browser itself reports no connectivity. A transient
// fetch rejection while genuinely online (slow network, a mid-navigation
// service worker update, etc.) must never hijack a working page load, so
// we re-throw and let the browser handle it normally in that case.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch (err) {
          if (self.navigator && self.navigator.onLine === false) {
            const cached = await caches.match(OFFLINE_URL);
            if (cached) return cached;
          }
          throw err;
        }
      })()
    );
  }
});
