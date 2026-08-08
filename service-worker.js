"use strict";
const VERSION = "mtech-pos-v4.4.0-r1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/css/app.css?v=4.4.0-r1",
  "/assets/vendor/zxing/zxing-browser.min.js?v=4.4.0-r1",
  "/assets/js/icons.js?v=4.4.0-r1",
  "/assets/js/db.js?v=4.4.0-r1",
  "/assets/js/app.js?v=4.4.0-r1",
  "/assets/images/products/bread-loaf.webp",
  "/assets/images/products/cooking-oil-1l.webp",
  "/assets/images/products/mineral-water-500ml.webp",
  "/assets/images/products/laundry-soap-bar.webp",
  "/assets/images/products/sugar-1kg.webp",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/screenshots/desktop-dashboard-v3.jpg",
  "/screenshots/mobile-pos.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match("/index.html")) ||
            caches.match("/offline.html"),
        ),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(VERSION)
                .then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => caches.match("/offline.html")),
    ),
  );
});
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
