importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded');

  // Configuración de Workbox
  workbox.setConfig({
    debug: false
  });

  // Cache de recursos estáticos con estrategia Cache First
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        }),
      ],
    })
  );

  // Cache de fuentes con estrategia Stale While Revalidate
  workbox.routing.registerRoute(
    /\.(?:woff|woff2|ttf|eot)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'fonts-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
        }),
      ],
    })
  );

  // Cache de CSS y JS con estrategia Stale While Revalidate
  workbox.routing.registerRoute(
    /\.(?:css|js)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
        }),
      ],
    })
  );

  // Cache de API con estrategia Network First para datos dinámicos
  workbox.routing.registerRoute(
    /\/api\//,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Cache de páginas HTML con estrategia Network First
  workbox.routing.registerRoute(
    /\/$/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        }),
      ],
    })
  );

  // Precaching de recursos críticos
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: null },
    { url: '/static/js/bundle.js', revision: null },
    { url: '/static/css/main.css', revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/logo192.png', revision: null },
    { url: '/logo512.png', revision: null },
  ]);

  // Background Sync para operaciones offline
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('offline-queue', {
    maxRetentionTime: 24 * 60, // 24 horas
  });

  // Aplicar background sync a rutas de API POST/PUT/DELETE
  workbox.routing.registerRoute(
    /\/api\/.*$/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'POST'
  );

  workbox.routing.registerRoute(
    /\/api\/.*$/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'PUT'
  );

  workbox.routing.registerRoute(
    /\/api\/.*$/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'DELETE'
  );

} else {
  console.log('Workbox could not be loaded. No offline support.');
}

// Evento de instalación
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'images-cache' &&
              cacheName !== 'fonts-cache' &&
              cacheName !== 'static-resources-cache' &&
              cacheName !== 'api-cache' &&
              cacheName !== 'pages-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Manejo de mensajes desde la aplicación principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuevo contenido disponible',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BTS Members', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  try {
    const cache = await caches.open('offline-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Error processing offline request:', error);
      }
    }
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
}

// Periodic background sync (si está disponible)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Sincronizar contenido en segundo plano
    const response = await fetch('/api/sync');
    if (response.ok) {
      const data = await response.json();
      // Notificar a los clientes sobre contenido actualizado
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CONTENT_UPDATED',
          data: data
        });
      });
    }
  } catch (error) {
    console.error('Error syncing content:', error);
  }
}

// Cache específico para datos de gamificación
const gamificationCache = 'gamification-cache-v1';

// Función para cachear datos de gamificación offline
async function cacheGamificationData() {
  try {
    const cache = await caches.open(gamificationCache);
    const gamificationData = {
      points: localStorage.getItem('gamification-points') || '0',
      achievements: localStorage.getItem('gamification-achievements') || '[]',
      challenges: localStorage.getItem('gamification-challenges') || '{}',
      stats: localStorage.getItem('gamification-stats') || '{}',
      soundEnabled: localStorage.getItem('gamification-sound-enabled') || 'true',
      timestamp: Date.now()
    };

    await cache.put('/gamification-data', new Response(JSON.stringify(gamificationData)));
    console.log('Gamification data cached for offline use');
  } catch (error) {
    console.error('Error caching gamification data:', error);
  }
}

// Función para recuperar datos de gamificación desde cache
async function getCachedGamificationData() {
  try {
    const cache = await caches.open(gamificationCache);
    const response = await cache.match('/gamification-data');
    if (response) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error retrieving cached gamification data:', error);
  }
  return null;
}

// Sincronización específica de gamificación
async function syncGamificationData() {
  try {
    // Intentar enviar datos pendientes al servidor
    const pendingData = await getPendingGamificationData();
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch('/api/gamification/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
        } catch (error) {
          console.error('Error syncing gamification data:', error);
          // Mantener en cola para reintento
          continue;
        }
      }
    }

    // Cachear datos actuales para uso offline
    await cacheGamificationData();

    // Notificar a clientes sobre sincronización exitosa
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'GAMIFICATION_SYNCED',
        timestamp: Date.now()
      });
    });

  } catch (error) {
    console.error('Error in gamification sync:', error);
  }
}

// Función para obtener datos pendientes de gamificación
async function getPendingGamificationData() {
  try {
    const cache = await caches.open('gamification-pending');
    const requests = await cache.keys();
    const pendingData = [];

    for (const request of requests) {
      try {
        const data = await request.json();
        pendingData.push(data);
      } catch (error) {
        console.error('Error reading pending data:', error);
      }
    }

    return pendingData;
  } catch (error) {
    console.error('Error getting pending gamification data:', error);
    return [];
  }
}

// Almacenar datos de gamificación y gestos táctiles pendientes cuando esté offline
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_GAMIFICATION_DATA') {
    event.waitUntil(storeGamificationData(event.data.data));
  } else if (event.data && event.data.type === 'STORE_GESTURE_DATA') {
    event.waitUntil(storeGestureData(event.data.data));
  }
});

async function storeGamificationData(data) {
  try {
    const cache = await caches.open('gamification-pending');
    const request = new Request(`/gamification-pending-${Date.now()}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    await cache.put(request, new Response(JSON.stringify(data)));
    console.log('Gamification data stored for later sync');
  } catch (error) {
    console.error('Error storing gamification data:', error);
  }
}

// Función para almacenar datos de gestos táctiles offline
async function storeGestureData(data) {
  try {
    const cache = await caches.open('gesture-pending');
    const request = new Request(`/gesture-pending-${Date.now()}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    await cache.put(request, new Response(JSON.stringify(data)));
    console.log('Gesture data stored for later sync');
  } catch (error) {
    console.error('Error storing gesture data:', error);
  }
}

// Función para obtener datos de gestos pendientes
async function getPendingGestureData() {
  try {
    const cache = await caches.open('gesture-pending');
    const requests = await cache.keys();
    const pendingData = [];

    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const data = await response.json();
        pendingData.push(data);
      } catch (error) {
        console.error('Error reading pending gesture data:', error);
      }
    }

    return pendingData;
  } catch (error) {
    console.error('Error getting pending gesture data:', error);
    return [];
  }
}

// Sincronización específica de gestos táctiles
async function syncGestureData() {
  try {
    const pendingData = await getPendingGestureData();
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch('/api/gestures/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          // Remover de cache si se sincronizó exitosamente
          const cache = await caches.open('gesture-pending');
          await cache.delete(`/gesture-pending-${data.timestamp}`);
        } catch (error) {
          console.error('Error syncing gesture data:', error);
          continue;
        }
      }
    }

    // Notificar a clientes sobre sincronización exitosa
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'GESTURES_SYNCED',
        timestamp: Date.now()
      });
    });

  } catch (error) {
    console.error('Error in gesture sync:', error);
  }
}

// Modificar el evento de sync para incluir gamificación y gestos
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue') {
    event.waitUntil(processOfflineQueue());
  } else if (event.tag === 'gamification-sync') {
    event.waitUntil(syncGamificationData());
  } else if (event.tag === 'gesture-sync') {
    event.waitUntil(syncGestureData());
  }
});

// Modificar periodic sync para incluir gamificación y gestos
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  } else if (event.tag === 'gamification-sync') {
    event.waitUntil(syncGamificationData());
  } else if (event.tag === 'gesture-sync') {
    event.waitUntil(syncGestureData());
  }
});