"use client";

import { useMemo } from "react";
import { useVendas } from "@/features/vendas/hooks";
import { useDespesas } from "@/features/despesas/hooks";
import { useProducoes } from "@/features/producao/hooks";
import { computeDashboard, type DashboardData } from "./compute";

export type { DashboardData };

/* O painel é derivado das listas (vendas/despesas/produções) que já ficam
   em cache. Assim ele funciona offline e reflete na hora os lançamentos
   feitos sem internet, sem depender de /api/dashboard. */
export function useDashboard() {
  const vendas = useVendas();
  const despesas = useDespesas();
  const producoes = useProducoes();

  const data = useMemo(
    () =>
      computeDashboard(
        vendas.data ?? [],
        despesas.data ?? [],
        producoes.data ?? []
      ),
    [vendas.data, despesas.data, producoes.data]
  );

  // "Carregando" só enquanto não há nada em cache ainda
  const isLoading =
    (vendas.isLoading && !vendas.data) ||
    (despesas.isLoading && !despesas.data) ||
    (producoes.isLoading && !producoes.data);

  return { data, isLoading };
}
