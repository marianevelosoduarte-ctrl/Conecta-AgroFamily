"use client";

import { CloudOff, RotateCw } from "lucide-react";

/* Página mostrada quando o usuário tenta abrir uma tela que ainda não está
   disponível offline. Fica pré-cacheada pelo service worker (sempre acessível,
   mesmo sem internet). */
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/15 text-warning">
        <CloudOff className="h-10 w-10" />
      </span>
      <div>
        <h1 className="text-xl font-bold text-foreground">Você está sem internet</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Esta tela ainda não foi carregada para uso offline. As telas que você
          já abriu continuam funcionando. Assim que a internet voltar, tudo será
          sincronizado automaticamente.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <RotateCw className="h-4 w-4" />
        Tentar de novo
      </button>
    </div>
  );
}
