/* ============================================================
   SERVICE WORKER — Grain & Cendre
   Cache les ressources statiques pour un mode hors-ligne basique
   ============================================================ */
const CACHE_NAME = 'gac-v2';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

// Ressources à mettre en cache immédiatement à l'installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/data/menu.json',
  '/data/roast.json',
  '/data/carnets.json',
  '/locales/fr.json',
  '/manifest.webmanifest'
];

// Installation : on met en cache les ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[sw] Erreur precache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation : on supprime les vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch : stratégie différenciée selon le type de ressource
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET et les origines externes
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Ignore les routes API (toujours fraîches)
  if (url.pathname.startsWith('/api/')) return;

  // Assets statiques (fonts, images, CSS, JS) → Cache first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Pages HTML et données → Network first, fallback cache
  event.respondWith(
    fetch(request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    }).catch(() => {
      return caches.match(request).then((cached) => {
        if (cached) return cached;
        // Fallback : page d'accueil depuis le cache
        return caches.match('/index.html');
      });
    })
  );
});