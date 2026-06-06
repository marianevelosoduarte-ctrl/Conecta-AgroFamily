"use client";

import { useEffect } from "react";

/* Registra o service worker (/sw.js) uma vez, no cliente, em produção.
   É o que habilita instalação como app e o cache offline. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Falha ao registrar o service worker:", err);
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
