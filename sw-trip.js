// Offline cache for the Trip Tracker page. Page loads from network when online (so updates arrive), from cache when offline.
const CACHE = 'trip-v1';
const PAGE = 'trip.html';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([PAGE, 'trip-icon.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  const mine = u.origin === location.origin && (u.pathname.endsWith('/' + PAGE) || u.pathname.endsWith('/trip-icon.png'));
  const font = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (e.request.method !== 'GET' || !(mine || font)) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(mine ? e.request.url.split('?')[0] : e.request, copy)); }
      return r;
    }).catch(() => caches.match(mine ? u.origin + u.pathname : e.request, { ignoreSearch: true }))
  );
});
