"use client";

import { useEffect } from "react";

/* Telas principais a deixar prontas para uso offline. */
const ROTAS = [
  "/inicio",
  "/producao",
  "/despesas",
  "/vendas",
  "/relatorios",
  "/simulador",
  "/clima",
  "/ajustes",
];

/* Busca as rotas (autenticado/online) para o service worker guardá-las em
   cache — assim o usuário consegue navegar entre as telas mesmo offline,
   sem precisar ter aberto cada uma antes. */
function aquecerRotas() {
  if (!navigator.onLine) return;
  for (const rota of ROTAS) {
    fetch(rota, { credentials: "same-origin" }).catch(() => {});
  }
}

/* Registra o service worker (/sw.js) em produção e aquece o cache. É o que
   habilita instalar como app e usar offline. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => aquecerRotas())
        .catch((err) => console.error("Falha ao registrar o service worker:", err));
    };

    // Quando o SW assume o controle da página (1ª visita), aquece o cache
    const onControllerChange = () => aquecerRotas();
    // Ao recuperar a internet, reaquece (pega telas novas)
    const onOnline = () => aquecerRotas();

    window.addEventListener("load", onLoad);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
