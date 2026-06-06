/* ————————————————————————————————————————————
   Service worker do Conecta Agrofamily.
   Objetivo: tornar o app instalável (PWA) e funcionar offline para as
   páginas/recursos JÁ visitados (estratégia stale-while-revalidate).
   NÃO cacheia /api (dados de cada agricultor vêm sempre frescos da rede)
   nem rotas de autenticação.
   ———————————————————————————————————————————— */

const CACHE = "agrofamily-v2";

self.addEventListener("install", () => {
  // Ativa a nova versão imediatamente
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches antigos de versões anteriores
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Só lida com GET de mesma origem
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cacheia dados/sessão — sempre rede
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next/webpack-hmr")) {
    return;
  }

  // stale-while-revalidate: responde do cache (se houver) e atualiza em segundo plano
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);

      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);

      // Para navegações (abrir páginas), tenta rede primeiro e cai pro cache offline
      if (req.mode === "navigate") {
        return network.then((res) => res || cached).catch(() => cached);
      }

      return cached || network;
    })()
  );
});
