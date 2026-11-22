const V = 'kitchen-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;

  if (url.pathname.startsWith('/img/')) {            // images: cache first (ids never change)
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  e.respondWith(caches.open(V).then(async c => {      // shell: stale-while-revalidate
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  }));
});

self.addEventListener('message', e => {               // drop cached images that are no longer in the list
  if (e.data?.type !== 'prune') return;
  const keep = new Set(e.data.urls);
  e.waitUntil(caches.open(V).then(async c => {
    for (const r of await c.keys()) {
      const p = new URL(r.url).pathname;
      if (p.startsWith('/img/') && !keep.has(p)) await c.delete(r);
    }
  }));
});
