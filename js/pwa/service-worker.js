const CACHE_NAME = 'minimal-pwa-cache';
const FILES_TO_CACHE = [
    '/',
    '/index.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => 
            response || fetch(event.request)
        )
    );
});