const CACHE_NAME = 'simple-cache-v1'
const urlsToCache = []

self.addEventListener('install', (event) => {
  console.log('service worker install')
  const preLoaded = caches
    .open(CACHE_NAME)
    .then((cache) => cache.addAll(urlsToCache))
  event.waitUntil(preLoaded)
})

self.addEventListener('fetch', (event) => {
  console.log('service worker fetch')
  const response = caches
    .match(event.request)
    .then((match) => match || fetch(event.request))
  event.respondWith(response)
})
