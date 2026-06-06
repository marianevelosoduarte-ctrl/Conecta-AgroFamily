"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Cliente, Venda, VendaFormValues } from "./types";

type MutateOpts = { onSuccess?: () => void };

export function useVendas() {
  return useQuery<Venda[]>({
    queryKey: ["vendas"],
    queryFn: async () => {
      const res = await fetch("/api/vendas");
      if (!res.ok) throw new Error("Erro ao carregar vendas");
      return res.json();
    },
  });
}

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const res = await fetch("/api/clientes");
      if (!res.ok) return [];
      return res.json();
    },
  });
}

function buildPayload(f: VendaFormValues) {
  return {
    produto: f.produto.trim(),
    quantidade: f.quantidade ? parseFloat(String(f.quantidade).replace(",", ".")) : 0,
    unidade: f.unidade || null,
    valorUnitario: f.valorUnitario
      ? parseFloat(String(f.valorUnitario).replace(",", "."))
      : 0,
    data: f.data,
    formaPagamento: f.formaPagamento,
    clienteId: f.clienteId || null,
    observacao: f.observacao.trim() || null,
  };
}

type VendaPayload = ReturnType<typeof buildPayload>;

/* Mutações resumíveis (offline-first) — lógica em registerOfflineMutations. */
export function useVendaMutations() {
  const create = useMutation<Venda, Error, VendaPayload>({
    mutationKey: ["vendas", "create"],
  });
  const update = useMutation<Venda, Error, { id: string; payload: VendaPayload }>({
    mutationKey: ["vendas", "update"],
  });
  const remove = useMutation<void, Error, { id: string }>({
    mutationKey: ["vendas", "delete"],
  });

  return {
    create: {
      mutate: (form: VendaFormValues, opts?: MutateOpts) =>
        create.mutate(buildPayload(form), opts),
      isPending: create.isPending,
    },
    update: {
      mutate: (vars: { id: string; form: VendaFormValues }, opts?: MutateOpts) =>
        update.mutate({ id: vars.id, payload: buildPayload(vars.form) }, opts),
      isPending: update.isPending,
    },
    remove: {
      mutate: (id: string, opts?: MutateOpts) => remove.mutate({ id }, opts),
      isPending: remove.isPending,
    },
  };
}

/** Cria um cliente rapidamente (usado direto no formulário de venda). */
export function useCreateCliente() {
  return useMutation<Cliente, Error, { nome: string; telefone?: string }>({
    mutationKey: ["clientes", "create"],
  });
}
