/* Curly service worker (optional). Keep it next to index.html to open the app offline. */
const V = 'curly-v3';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;   // never touch Gemini or other sites
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r && r.ok && (r.type === 'basic' || r.type === 'cors')) c.put(e.request, r.clone()); return r; }).catch(() => hit || (e.request.mode === 'navigate' ? c.match('./index.html') : undefined));
    return hit || net;
  }));
});
