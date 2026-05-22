"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Despesa, DespesaFormValues } from "./types";

export function useDespesas() {
  return useQuery<Despesa[]>({
    queryKey: ["despesas"],
    queryFn: async () => {
      const res = await fetch("/api/despesas");
      if (!res.ok) throw new Error("Erro ao carregar despesas");
      return res.json();
    },
  });
}

function buildPayload(f: DespesaFormValues) {
  return {
    descricao: f.descricao.trim(),
    categoria: f.categoria,
    valor: f.valor ? parseFloat(String(f.valor).replace(",", ".")) : 0,
    data: f.data,
    producaoId: f.producaoId || null,
    observacao: f.observacao.trim() || null,
  };
}

export function useDespesaMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["despesas"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation<Despesa, Error, DespesaFormValues>({
    mutationFn: async (f) => {
      const res = await fetch("/api/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(f)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Despesa registrada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation<Despesa, Error, { id: string; form: DespesaFormValues }>({
    mutationFn: async ({ id, form }) => {
      const res = await fetch(`/api/despesas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Despesa atualizada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/despesas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
    },
    onSuccess: () => {
      toast.success("Despesa excluída.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
