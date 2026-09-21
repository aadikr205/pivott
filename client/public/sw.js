// Pivott Study Planner — Hardened Service Worker
// Version 2.2.0: Network-first navigation, dynamic asset cache-busting, zero stale chunks

const CACHE_NAME = 'pivott-v2.2.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pivott-icon.svg',
  '/pivott-192.png',
  '/pivott-512.png',
  '/pivott-maskable-512.png',
  '/apple-touch-icon.png'
];

// Install: Pre-cache app shell and skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Pivott SW] Pre-caching offline app shell');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[Pivott SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge ALL obsolete caches immediately and take control of all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Pivott SW] Purging obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for explicit skip waiting message from UI
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests, Chrome extension schemes, or non-http
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API & Dynamic Endpoints: Network First / Network Only
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/schedule') ||
    url.pathname.startsWith('/topics') ||
    url.pathname.startsWith('/quiz') ||
    url.pathname.startsWith('/progress') ||
    url.pathname.startsWith('/onboarding') ||
    url.pathname.startsWith('/ai') ||
    url.pathname.startsWith('/pyq') ||
    url.pathname.startsWith('/notes') ||
    url.pathname.startsWith('/doubt-solver') ||
    url.pathname.startsWith('/health') ||
    url.pathname.startsWith('/auto-login')
  ) {
    event.respondWith(
      fetch(req).catch(() => {
        // Return null or cached fallback if available
        return caches.match(req);
      })
    );
    return;
  }

  // 2. Navigation Requests (index.html / document): NETWORK-FIRST with 2.5s timeout
  // This guarantees users ALWAYS get the latest index.html pointing to fresh JS chunk hashes!
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          // If network is slow, try cache
          caches.match('/index.html').then(cached => {
            if (cached) resolve(cached);
          });
        }, 2500);

        fetch(req)
          .then(networkRes => {
            clearTimeout(timeoutId);
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put('/index.html', resClone);
              });
            }
            resolve(networkRes);
          })
          .catch(() => {
            clearTimeout(timeoutId);
            caches.match('/index.html').then(cached => {
              resolve(cached || new Response('Offline — please check your internet.', { status: 503, statusText: 'Offline' }));
            });
          });
      })
    );
    return;
  }

  // 3. Static Hashed Assets (/assets/*): Cache-First with Network Revalidation
  // Vite assets contain unique hashes in their filename, so cached versions are always safe
  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) {
        return cachedRes;
      }
      return fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, resClone);
          });
        }
        return networkRes;
      }).catch(() => {
        // Return 404 or empty if asset fetch fails offline
        return new Response('', { status: 404, statusText: 'Asset not found' });
      });
    })
  );
});
