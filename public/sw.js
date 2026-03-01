const CACHE_NAME = "fetch-app-v1";
const API_CACHE = "fetch-api-v1";
const SHELL_URLS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          const cachedTime = cached.headers.get("sw-cached-at");
          if (cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
            return cached;
          }
        }
        try {
          const response = await fetch(request);
          if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set("sw-cached-at", Date.now().toString());
            const body = await response.clone().blob();
            cache.put(request, new Response(body, { status: response.status, headers }));
          }
          return response;
        } catch {
          return cached || new Response(JSON.stringify({ error: "offline" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() =>
      caches.match("/index.html")
    ))
  );
});
