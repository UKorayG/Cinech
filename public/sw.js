/* Cinech service worker — sürümlü önbellek, hafif ve güvenli.
 * - /icons, /brand, /posters, /grid.svg ve /_next/static (içerik karmalı, değişmez): önce önbellek
 * - Sayfa gezintileri: önce ağ, bağlantı yoksa /offline
 * - GET dışı, farklı kaynaklı, chrome-extension ve /_next/webpack-hmr isteklerine dokunulmaz
 */
const VERSION = 'v1';
const STATIC_CACHE = `cinech-static-${VERSION}`;
const PAGE_CACHE = `cinech-pages-${VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, PAGE_CACHE];
const OFFLINE_URL = '/offline';

const STATIC_PREFIXES = ['/icons/', '/brand/', '/posters/', '/_next/static/'];
const STATIC_FILES = ['/grid.svg', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      try {
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
      } catch {
        /* kurulum sırasında çevrimdışıysa sessiz kal */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('cinech-') && !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

function isStatic(url) {
  return STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) || STATIC_FILES.includes(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // farklı kaynak, chrome-extension vb.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstPage(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return (
      offline ||
      new Response('Çevrimdışı — projeksiyon odasına ulaşılamıyor.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}
