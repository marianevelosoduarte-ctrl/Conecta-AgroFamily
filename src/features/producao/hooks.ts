"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Producao, ProducaoFormValues } from "./types";

export function useProducoes() {
  return useQuery<Producao[]>({
    queryKey: ["producoes"],
    queryFn: async () => {
      const res = await fetch("/api/producoes");
      if (!res.ok) throw new Error("Erro ao carregar produções");
      return res.json();
    },
  });
}

function buildPayload(f: ProducaoFormValues) {
  return {
    cultura: f.cultura.trim(),
    variedade: f.variedade.trim() || null,
    areaHa: f.areaHa ? parseFloat(String(f.areaHa).replace(",", ".")) : null,
    dataPlantio: f.dataPlantio || null,
    dataColheitaPrevista: f.dataColheitaPrevista || null,
    dataColheita: f.dataColheita || null,
    quantidadeColhida: f.quantidadeColhida
      ? parseFloat(String(f.quantidadeColhida).replace(",", "."))
      : null,
    unidade: f.unidade || null,
    status: f.status,
    observacao: f.observacao.trim() || null,
  };
}

export function useProducaoMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["producoes"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation<Producao, Error, ProducaoFormValues>({
    mutationFn: async (f) => {
      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(f)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Produção registrada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation<Producao, Error, { id: string; form: ProducaoFormValues }>({
    mutationFn: async ({ id, form }) => {
      const res = await fetch(`/api/producoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Produção atualizada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/producoes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
    },
    onSuccess: () => {
      toast.success("Produção excluída.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}
