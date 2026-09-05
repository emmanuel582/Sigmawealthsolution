// Service Worker unregister stub to prevent 404s and clean up legacy browser SWs
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => {
          if (client && client.navigate) {
            // no-op
          }
        });
      })
  );
});
