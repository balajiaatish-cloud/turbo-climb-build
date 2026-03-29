const CACHE_NAME = 'hillclimb-static-v1';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.webmanifest',
    './js/graphics.js',
    './js/gameconfig.js',
    './js/audio.js',
    './js/main.js',
    './js/pwa.js',
    './js/scenes/preloadscene.js',
    './js/scenes/titlescene.js',
    './js/scenes/shopscene.js',
    './js/scenes/mapscene.js',
    './js/scenes/rewardscene.js',
    './js/scenes/goalsscene.js',
    './js/scenes/gamescene.js',
    './js/scenes/gameoverscene.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

const RUNTIME_CDN = [
    'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_SHELL);
        await Promise.all(RUNTIME_CDN.map(async (url) => {
            try {
                await cache.add(new Request(url, { mode: 'no-cors' }));
            } catch (error) {
                console.warn('PWA runtime cache skipped:', url, error);
            }
        }));
        self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(event.request);
            const url = new URL(event.request.url);
            if (url.origin === self.location.origin || url.hostname === 'cdn.jsdelivr.net') {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            const fallback = await caches.match('./index.html');
            if (fallback && event.request.mode === 'navigate') {
                return fallback;
            }
            throw error;
        }
    })());
});
