"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, type ReactNode } from "react";
import { registerOfflineMutations } from "@/lib/offline/offline-mutations";

/* ————————————————————————————————————————————
   QueryProvider — montado uma vez no root.

   Além do cache em memória, PERSISTE o cache no localStorage para o app
   funcionar OFFLINE: as listas já carregadas continuam visíveis e as
   mutações feitas sem internet ficam pausadas/persistidas e são
   reenviadas (resumePausedMutations) quando a conexão volta.
   ———————————————————————————————————————————— */

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          // gcTime longo p/ os dados sobreviverem no cache offline
          gcTime: 1000 * 60 * 60 * 24, // 24h
          retry: 1,
          refetchOnWindowFocus: false,
        },
        mutations: { retry: 0 },
      },
    });
    // Registra as mutações offline ANTES de qualquer resume.
    registerOfflineMutations(qc);
    return qc;
  });

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      key: "AGROFAMILY_OFFLINE_CACHE",
    })
  );

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // mantém o cache por 7 dias
        dehydrateOptions: {
          // persiste também as mutações pausadas (fila offline)
          shouldDehydrateMutation: (m) => m.state.isPaused,
        },
      }}
      onSuccess={() => {
        // Cache restaurado → tenta reenviar o que ficou pendente
        client.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
