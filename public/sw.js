/* ————————————————————————————————————————————
   Service worker do Conecta Agrofamily.

   - Instalável (PWA) e funciona OFFLINE.
   - Navegação (abrir telas): rede primeiro; sem internet, usa a versão em
     cache; se a tela nunca foi carregada, mostra a página /offline em vez do
     erro do navegador.
   - Demais GET (JS/CSS/RSC/imagens): stale-while-revalidate.
   - NÃO cacheia /api (dados de cada agricultor vêm sempre frescos da rede).
   ———————————————————————————————————————————— */

const CACHE = "agrofamily-v3";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        await cache.add(OFFLINE_URL);
      } catch {
        // se falhar (ex: build novo), segue mesmo assim
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Dados/sessão e HMR: sempre rede
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next/webpack-hmr")) {
    return;
  }

  // Navegação (abrir uma tela): rede → cache → página offline
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          const cached = await cache.match(req);
          return cached || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
    return;
  }

  // Demais GET: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
