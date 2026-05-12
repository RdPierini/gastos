const CACHE_NAME = 'controle-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js'
];

// Instala e faz cache dos assets principais
self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
self.addEventListener('fetch', ev => {
  // Ignora requisições do Firebase (sempre online)
  if (ev.request.url.includes('firestore') || ev.request.url.includes('firebase')) return;

  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        // Atualiza cache com resposta mais recente
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(ev.request, clone));
        return res;
      })
      .catch(() => caches.match(ev.request))
  );
});
