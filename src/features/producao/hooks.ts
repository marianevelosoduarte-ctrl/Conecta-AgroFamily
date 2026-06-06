"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Producao, ProducaoFormValues } from "./types";

type MutateOpts = { onSuccess?: () => void };

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

type ProducaoPayload = ReturnType<typeof buildPayload>;

/* Mutações resumíveis (offline-first) — lógica em registerOfflineMutations. */
export function useProducaoMutations() {
  const create = useMutation<Producao, Error, ProducaoPayload>({
    mutationKey: ["producoes", "create"],
  });
  const update = useMutation<Producao, Error, { id: string; payload: ProducaoPayload }>({
    mutationKey: ["producoes", "update"],
  });
  const remove = useMutation<void, Error, { id: string }>({
    mutationKey: ["producoes", "delete"],
  });

  return {
    create: {
      mutate: (form: ProducaoFormValues, opts?: MutateOpts) =>
        create.mutate(buildPayload(form), opts),
      isPending: create.isPending,
    },
    update: {
      mutate: (vars: { id: string; form: ProducaoFormValues }, opts?: MutateOpts) =>
        update.mutate({ id: vars.id, payload: buildPayload(vars.form) }, opts),
      isPending: update.isPending,
    },
    remove: {
      mutate: (id: string, opts?: MutateOpts) => remove.mutate({ id }, opts),
      isPending: remove.isPending,
    },
  };
}
