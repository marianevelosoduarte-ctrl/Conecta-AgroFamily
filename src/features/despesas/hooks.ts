"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Despesa, DespesaFormValues } from "./types";

/** Opções aceitas pelo .mutate (só usamos onSuccess para fechar o diálogo). */
type MutateOpts = { onSuccess?: () => void };

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

type DespesaPayload = ReturnType<typeof buildPayload>;

/* Mutações resumíveis (offline-first): só declaram a mutationKey — a lógica
   (fetch, update otimista, toast, invalidação) vive em registerOfflineMutations. */
export function useDespesaMutations() {
  const create = useMutation<Despesa, Error, DespesaPayload>({
    mutationKey: ["despesas", "create"],
  });
  const update = useMutation<Despesa, Error, { id: string; payload: DespesaPayload }>({
    mutationKey: ["despesas", "update"],
  });
  const remove = useMutation<void, Error, { id: string }>({
    mutationKey: ["despesas", "delete"],
  });

  return {
    create: {
      mutate: (form: DespesaFormValues, opts?: MutateOpts) =>
        create.mutate(buildPayload(form), opts),
      isPending: create.isPending,
    },
    update: {
      mutate: (vars: { id: string; form: DespesaFormValues }, opts?: MutateOpts) =>
        update.mutate({ id: vars.id, payload: buildPayload(vars.form) }, opts),
      isPending: update.isPending,
    },
    remove: {
      mutate: (id: string, opts?: MutateOpts) => remove.mutate({ id }, opts),
      isPending: remove.isPending,
    },
  };
}
