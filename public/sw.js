// Service Worker for GAMA Health OS
// IMPORTANT: Do NOT intercept navigation requests or RSC requests.
// Doing so strips Next.js RSC headers and causes "Failed to fetch" errors.

const CACHE_NAME = 'gama-static-v1';
const STATIC_ASSETS = [
  '/logo.jpg',
  '/manifest.json',
  '/dashboard-bg-clean.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Remove old caches including any stale nexus-related entries
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never intercept navigation requests - they carry RSC headers
  // Next.js App Router sends RSC payloads with special headers that must not be stripped
  if (event.request.mode === 'navigate') {
    return; // Let browser handle natively
  }

  // Never intercept RSC requests (have _rsc query param or Next-Router headers)
  if (url.searchParams.has('_rsc') || event.request.headers.has('rsc')) {
    return;
  }

  // Never intercept API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Never intercept Next.js internal requests
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // Only cache static assets from our list
  if (STATIC_ASSETS.some((asset) => url.pathname === asset)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  }
  // All other requests: let the browser handle them natively (no intercept)
});
