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
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'MedRemind Alert'
  const options = {
    body: data.body || 'Time to take your medicine!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'take', title: '✅ Take Now' },
      { action: 'later', title: '⏰ Later' }
    ]
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'take') {
    event.waitUntil(clients.openWindow('/?action=take'))
  } else if (event.action === 'later') {
    event.waitUntil(clients.openWindow('/?action=later'))
  } else {
    event.waitUntil(clients.openWindow('/'))
  }
})