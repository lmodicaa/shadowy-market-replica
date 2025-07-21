// Service Worker for MateCloud performance optimization

const CACHE_NAME = 'matecloud-v1.0.0';
const CRITICAL_ASSETS = [
  '/',
  '/attached_assets/logo.png',
  '/favicon.png',
  '/favicon.ico'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('SW: Critical assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Failed to cache critical assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SW: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache static assets
            if (shouldCache(event.request.url)) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Helper function to determine if URL should be cached
function shouldCache(url) {
  const cacheableExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.css', '.js'];
  const cacheablePaths = ['/attached_assets/', '/favicon'];
  
  return cacheableExtensions.some(ext => url.includes(ext)) ||
         cacheablePaths.some(path => url.includes(path));
}

console.log('SW: Service Worker loaded');