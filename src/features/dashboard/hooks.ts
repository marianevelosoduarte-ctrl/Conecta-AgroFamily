"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  receita: { total: number; mes: number };
  despesa: { total: number; mes: number };
  lucro: { total: number; mes: number };
  serie: { mes: string; receita: number; despesa: number }[];
  categorias: { nome: string; valor: number }[];
  producao: { total: number; ativas: number; area: number };
  contagem: { vendas: number; despesas: number };
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Erro ao carregar o painel");
      return res.json();
    },
  });
}
