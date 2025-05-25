const CACHE = 'v1'
const urlToCache = [
  '/',
  '/map/blood_river',
  '/map/fata_morga',

  '/static/img/default.jpg',
  
  '/static/style/main.css',
  '/static/style/loader.css',
  
  '/static/wasm/wasm_exec.js',
  '/static/wasm/raycasting.wasm',
  
  '/static/js/index.js',
  '/static/js/canvas.js',
  '/static/js/elements.js',
  '/static/js/fadeOut.js',
  '/static/js/gameLoop.js',
  '/static/js/keyboard.js',
  '/static/js/movement.js',
  '/static/js/settings.js',
  '/static/js/touch.js',

  '/fallback'
]


self.addEventListener('install', (event) => {
  event.waitUntil(async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(urlToCache);
    self.skipWaiting();
  })
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(async () => {
    try {
      const response = await fetch(event.request);
      
      const cache = await caches.open(CACHE);
      cache.put(event.request, response.clone());

      return response;
    } catch (error) {
      const cachedResponse = await caches.match(event.request);
        
      // Если закэшированный ресурс есть, то возвращаем его
      if (cachedResponse) {
        return cachedResponse;
      }

      return await cache.match('/fallback');
    }
  })
});
