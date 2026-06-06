"use client";

import { useEffect, useState } from "react";
import { onlineManager, useMutationState } from "@tanstack/react-query";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ————————————————————————————————————————————
   Indicador de conexão/sincronização na topbar.
   - Offline: chip âmbar (+ nº de alterações na fila, se houver)
   - Online com fila: chip azul "Enviando…"
   - Online e fila vazia: aparece "Tudo sincronizado" por alguns segundos
   ———————————————————————————————————————————— */

export function SyncStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(onlineManager.isOnline());
    return onlineManager.subscribe(() => setOnline(onlineManager.isOnline()));
  }, []);

  // Conta mutações pendentes (inclui as pausadas offline na fila)
  const pendentes = useMutationState({
    filters: { predicate: (m) => m.state.status === "pending" },
  }).length;

  // Mostra "Tudo sincronizado" por um instante quando a fila zera estando online
  const [acabouDeSincronizar, setAcabouDeSincronizar] = useState(false);
  const [jaTevePendentes, setJaTevePendentes] = useState(false);
  useEffect(() => {
    if (pendentes > 0) {
      setJaTevePendentes(true);
      return;
    }
    if (jaTevePendentes && online) {
      setAcabouDeSincronizar(true);
      setJaTevePendentes(false);
      const t = setTimeout(() => setAcabouDeSincronizar(false), 3000);
      return () => clearTimeout(t);
    }
  }, [pendentes, online, jaTevePendentes]);

  const base =
    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium";

  if (!online) {
    return (
      <div className={cn(base, "bg-warning/15 text-warning")}>
        <CloudOff className="h-4 w-4" />
        <span className="hidden sm:inline">Offline</span>
        {pendentes > 0 && <span>· {pendentes} p/ enviar</span>}
      </div>
    );
  }

  if (pendentes > 0) {
    return (
      <div className={cn(base, "bg-info/15 text-info")}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Enviando…</span>
        <span>{pendentes}</span>
      </div>
    );
  }

  if (acabouDeSincronizar) {
    return (
      <div className={cn(base, "bg-success/15 text-success")}>
        <CheckCircle2 className="h-4 w-4" />
        <span className="hidden sm:inline">Tudo sincronizado</span>
      </div>
    );
  }

  return null;
}
