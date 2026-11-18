// Kopfsache – Offline-Speicher
const V = 'kopfsache-v8';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'touch-icon-2.png', 'app-icon-192-2.png', 'app-icon-512-2.png', 'content.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Stoff: immer zuerst frisch aus dem Netz, offline aus dem Speicher
  if (url.pathname.endsWith('/content.json')) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put('content.json', copy)); }
      return res;
    }).catch(() => caches.match('content.json')));
    return;
  }
  // Schriften: einmal laden, dann aus dem Speicher
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  // App selbst: sofort aus dem Speicher, im Hintergrund aktualisieren
  // App-Seite: zuerst frisch aus dem Netz (Updates sofort), offline aus dem Speicher
  if (url.origin === location.origin && req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put('index.html', copy)); }
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  if (url.origin === location.origin) {
    const key = req;
    e.respondWith(caches.match(key, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(key, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
