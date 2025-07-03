const CACHE_NAME = 'url-shortener-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/styles.css', // if you have a separate CSS file
  'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/'))
  );
}); 