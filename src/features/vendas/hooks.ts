"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Cliente, Venda, VendaFormValues } from "./types";

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
    valorUnitario: f.valorUnitario ? parseFloat(String(f.valorUnitario).replace(",", ".")) : 0,
    data: f.data,
    formaPagamento: f.formaPagamento,
    clienteId: f.clienteId || null,
    observacao: f.observacao.trim() || null,
  };
}

export function useVendaMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["vendas"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation<Venda, Error, VendaFormValues>({
    mutationFn: async (f) => {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(f)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Venda registrada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation<Venda, Error, { id: string; form: VendaFormValues }>({
    mutationFn: async ({ id, form }) => {
      const res = await fetch(`/api/vendas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Venda atualizada.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/vendas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
    },
    onSuccess: () => {
      toast.success("Venda excluída.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return { create, update, remove };
}

/** Cria um cliente rapidamente (usado direto no formulário de venda). */
export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation<Cliente, Error, { nome: string; telefone?: string }>({
    mutationFn: async (data) => {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar cliente");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
    onError: (e) => toast.error(e.message),
  });
}
