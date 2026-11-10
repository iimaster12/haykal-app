// Offline support. Every app file is stored on first visit. Requests go to the
// network first (so updates show up), and fall back to the stored copy when
// there is no connection. The file list and version are rewritten by
// .claude/build_app.py on each release.
const VERSION = 'haykal-c02a442d10';
const FILES = ['./', './css/app.css', './fonts/OFL-IBMPlexSansArabic.txt', './fonts/OFL-ReadexPro.txt', './fonts/files/IBMPlexSansArabic-arabic-0.woff2', './fonts/files/IBMPlexSansArabic-arabic-2.woff2', './fonts/files/IBMPlexSansArabic-arabic-4.woff2', './fonts/files/IBMPlexSansArabic-latin-1.woff2', './fonts/files/IBMPlexSansArabic-latin-3.woff2', './fonts/files/IBMPlexSansArabic-latin-5.woff2', './fonts/files/ReadexPro-arabic-6.woff2', './fonts/files/ReadexPro-latin-7.woff2', './fonts/fonts.css', './icons/apple-touch-icon.png', './icons/favicon-64.png', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './index.html', './install.html', './js/builder.js', './js/building.js', './js/data.js', './js/detail.js', './js/failures.js', './js/foundations.js', './js/guide.js', './js/house.js', './js/i18n.js', './js/icons.js', './js/install.js', './js/lab.js', './js/learn.js', './js/loadpath.js', './js/main.js', './js/quiz.js', './js/textures.js', './manifest.webmanifest', './vendor/three/LICENSE', './vendor/three/build/three.module.min.js', './vendor/three/examples/jsm/controls/OrbitControls.js', './vendor/three/examples/jsm/environments/RoomEnvironment.js', './vendor/three/examples/jsm/renderers/CSS2DRenderer.js', './vendor/three/examples/jsm/utils/BufferGeometryUtils.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok) { const c = await caches.open(VERSION); c.put(req, res.clone()); }
      return res;
    } catch {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
