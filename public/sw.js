// public/sw.js
const CACHE_NAME = "medreminder-v2";
const urlsToCache = ["/", "/index.html"];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim()
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
})

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// PUSH NOTIFICATIONS
self.addEventListener("push", (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icons/icon-192.png",
  })
})