/**
 * ShopNest Ethiopia Service Worker
 * Progressive Web App offline caching & network strategy
 * 
 * STRICT COMPLIANCE:
 * "Never cache sensitive user/cart/checkout data"
 */

const CACHE_VERSION = 'shopnest-v1';
const STATIC_CACHE_NAME = `${CACHE_VERSION}-static`;
const ASSET_CACHE_NAME = `${CACHE_VERSION}-assets`;

// Shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable.svg',
];

// Sensitive path fragments that MUST NEVER be cached
const SENSITIVE_PATHS = [
  '/api/',
  '/checkout',
  '/cart',
  '/account',
  '/admin',
  '/login',
  '/register',
  '/auth',
];

/**
 * Checks whether a request points to sensitive data
 */
function isSensitiveRequest(request) {
  // Non-GET requests (POST, PUT, PATCH, DELETE) mutate data and must never be cached
  if (request.method !== 'GET') {
    return true;
  }

  const url = new URL(request.url);

  // Any backend API request is sensitive or dynamic
  if (url.pathname.startsWith('/api/')) {
    return true;
  }

  // Check URL pathname against sensitive path prefixes
  for (const path of SENSITIVE_PATHS) {
    if (url.pathname === path || url.pathname.startsWith(path + '/')) {
      return true;
    }
  }

  // Authorization headers check
  if (request.headers.has('Authorization')) {
    return true;
  }

  return false;
}

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ShopNest-SW] Pre-cache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== ASSET_CACHE_NAME) {
            console.log('[ShopNest-SW] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Strictly bypass cache for all sensitive data and API requests
  if (isSensitiveRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a clean JSON response if an API request fails offline
        if (url.pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'You are currently offline. Please check your internet connection and try again.',
              isOffline: true,
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        // If navigating to a sensitive page offline, show the offline page
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return Promise.reject('Offline');
      })
    );
    return;
  }

  // 2. Navigation Requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid, return network response
          if (response && response.status === 200) {
            return response;
          }
          // Fallback to cached index.html for SPA routing
          return caches.match('/index.html').then((cached) => cached || response);
        })
        .catch(() => {
          // Offline navigation fallback
          return caches.match('/offline.html').then((offlinePage) => {
            return offlinePage || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 3. Static Assets: JS, CSS, Fonts, Images
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate for assets
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(ASSET_CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              /* ignore background revalidation errors when offline */
            });
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(ASSET_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // If image fails, return empty SVG placeholder or fail gracefully
            if (request.destination === 'image') {
              return caches.match('/icons/icon-192x192.svg');
            }
          });
      })
    );
    return;
  }

  // Default network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
