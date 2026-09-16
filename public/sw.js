const CACHE_NAME = "stall-sales-shell-v1";

const PRECACHE_URLS = [
  "/",
  "/inventory",
  "/sales",
  "/sales/new",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => undefined),
        ),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key.startsWith("stall-sales-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname === "/sw.js") {
    return;
  }

  event.respondWith(handleSameOriginGet(request, url));
});

async function handleSameOriginGet(request, url) {
  if (url.pathname.startsWith("/_next/static/")) {
    return cacheFirst(request);
  }

  return networkFirst(request, url);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  await putInCache(request, response);
  return response;
}

async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    await putInCache(request, response);
    return response;
  } catch (error) {
    const cached = await matchCached(request, url);

    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      const home = await caches.match("/");
      if (home) {
        return home;
      }
    }

    throw error;
  }
}

async function matchCached(request, url) {
  const exact = await caches.match(request);

  if (exact) {
    return exact;
  }

  const pathOnly = await caches.match(url.pathname);

  if (pathOnly) {
    return pathOnly;
  }

  return null;
}

async function putInCache(request, response) {
  if (!response || !response.ok || response.status === 206) {
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch {
    // Ignore quota errors. Never store application data here.
  }
}
