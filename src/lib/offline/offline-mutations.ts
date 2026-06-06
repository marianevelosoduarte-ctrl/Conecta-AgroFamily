import { QueryClient, type MutationFunction } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Despesa } from "@/features/despesas/types";
import type { Venda, Cliente } from "@/features/vendas/types";
import type { Producao } from "@/features/producao/types";

/* ————————————————————————————————————————————
   Infraestrutura OFFLINE.

   Cada mutação (criar/editar/excluir) é registrada via setMutationDefaults
   com uma mutationKey estável. Isso é o que torna as mutações RESUMÍVEIS:
   quando o usuário está sem internet, a mutação fica "pausada" e é
   persistida no localStorage (ver query-provider). Ao voltar a internet
   (ou ao reabrir o app), resumePausedMutations() reexecuta a mutationFn.

   onMutate aplica um update OTIMISTA no cache (a lista da tela), então o
   registro aparece na hora mesmo offline. onError desfaz; onSettled
   revalida (quando online) pra trocar o item temporário pelo real.
   ———————————————————————————————————————————— */

export interface OfflineItem {
  id: string;
}

interface EntityConfig<TItem extends OfflineItem, TPayload> {
  /** chave da query/lista no cache, ex: "despesas" */
  key: string;
  /** endpoint REST base, ex: "/api/despesas" */
  endpoint: string;
  /** outras queries a revalidar após sincronizar (ex: "dashboard") */
  extraInvalidate?: readonly string[];
  messages: { created?: string; updated?: string; removed?: string };
  /** monta o item otimista que aparece na lista enquanto não sincroniza */
  buildOptimistic: (payload: TPayload, tempId: string, qc: QueryClient) => TItem;
  /** aplica a edição otimista sobre o item existente */
  applyUpdate?: (item: TItem, payload: TPayload) => TItem;
  hasUpdate?: boolean;
  hasRemove?: boolean;
}

interface RollbackCtx<TItem> {
  prev?: TItem[];
}

/** ID temporário para o item criado offline (trocado pelo real ao sincronizar). */
function makeTempId(): string {
  return `temp-${crypto.randomUUID()}`;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error || "Erro ao salvar";
  } catch {
    return "Erro ao salvar";
  }
}

function registerEntity<TItem extends OfflineItem, TPayload>(
  qc: QueryClient,
  cfg: EntityConfig<TItem, TPayload>
) {
  const listKey = [cfg.key];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: listKey });
    cfg.extraInvalidate?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };

  const rollback = (
    err: unknown,
    _vars: unknown,
    ctx: RollbackCtx<TItem> | undefined
  ) => {
    if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    toast.error(err instanceof Error ? err.message : "Erro ao salvar");
  };

  // ———————— CRIAR ————————
  qc.setMutationDefaults([cfg.key, "create"], {
    mutationFn: (async (payload: TPayload) => {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readError(res));
      return res.json();
    }) as MutationFunction<TItem, TPayload>,
    onMutate: async (payload: TPayload): Promise<RollbackCtx<TItem>> => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<TItem[]>(listKey);
      const optimistic = cfg.buildOptimistic(payload, makeTempId(), qc);
      qc.setQueryData<TItem[]>(listKey, (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: rollback,
    onSuccess: () => {
      if (cfg.messages.created) toast.success(cfg.messages.created);
    },
    onSettled: invalidate,
  });

  // ———————— EDITAR ————————
  if (cfg.hasUpdate && cfg.applyUpdate) {
    const applyUpdate = cfg.applyUpdate;
    qc.setMutationDefaults([cfg.key, "update"], {
      mutationFn: (async ({ id, payload }: { id: string; payload: TPayload }) => {
        const res = await fetch(`${cfg.endpoint}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      }) as MutationFunction<TItem, { id: string; payload: TPayload }>,
      onMutate: async ({
        id,
        payload,
      }: {
        id: string;
        payload: TPayload;
      }): Promise<RollbackCtx<TItem>> => {
        await qc.cancelQueries({ queryKey: listKey });
        const prev = qc.getQueryData<TItem[]>(listKey);
        qc.setQueryData<TItem[]>(listKey, (old = []) =>
          old.map((it) => (it.id === id ? applyUpdate(it, payload) : it))
        );
        return { prev };
      },
      onError: rollback,
      onSuccess: () => {
        if (cfg.messages.updated) toast.success(cfg.messages.updated);
      },
      onSettled: invalidate,
    });
  }

  // ———————— EXCLUIR ————————
  if (cfg.hasRemove) {
    qc.setMutationDefaults([cfg.key, "delete"], {
      mutationFn: (async ({ id }: { id: string }) => {
        const res = await fetch(`${cfg.endpoint}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await readError(res));
      }) as MutationFunction<void, { id: string }>,
      onMutate: async ({ id }: { id: string }): Promise<RollbackCtx<TItem>> => {
        await qc.cancelQueries({ queryKey: listKey });
        const prev = qc.getQueryData<TItem[]>(listKey);
        qc.setQueryData<TItem[]>(listKey, (old = []) =>
          old.filter((it) => it.id !== id)
        );
        return { prev };
      },
      onError: rollback,
      onSuccess: () => {
        if (cfg.messages.removed) toast.success(cfg.messages.removed);
      },
      onSettled: invalidate,
    });
  }
}

// ———————— Payloads (espelham o buildPayload de cada feature) ————————

interface DespesaPayload {
  descricao: string;
  categoria: Despesa["categoria"];
  valor: number;
  data: string;
  producaoId: string | null;
  observacao: string | null;
}

interface VendaPayload {
  produto: string;
  quantidade: number;
  unidade: string | null;
  valorUnitario: number;
  data: string;
  formaPagamento: Venda["formaPagamento"];
  clienteId: string | null;
  observacao: string | null;
}

interface ProducaoPayload {
  cultura: string;
  variedade: string | null;
  areaHa: number | null;
  dataPlantio: string | null;
  dataColheitaPrevista: string | null;
  dataColheita: string | null;
  quantidadeColhida: number | null;
  unidade: string | null;
  status: Producao["status"];
  observacao: string | null;
}

interface ClientePayload {
  nome: string;
  telefone?: string;
}

/**
 * Registra todas as mutações offline no QueryClient. Chamada uma única vez
 * na criação do client (antes de resumePausedMutations).
 */
export function registerOfflineMutations(qc: QueryClient) {
  // Despesas
  registerEntity<Despesa, DespesaPayload>(qc, {
    key: "despesas",
    endpoint: "/api/despesas",
    extraInvalidate: ["dashboard"],
    messages: {
      created: "Despesa registrada.",
      updated: "Despesa atualizada.",
      removed: "Despesa excluída.",
    },
    hasUpdate: true,
    hasRemove: true,
    buildOptimistic: (p, tempId, client) => {
      const producoes =
        client.getQueryData<{ id: string; cultura: string }[]>(["producoes"]) ?? [];
      const prod = p.producaoId
        ? producoes.find((x) => x.id === p.producaoId)
        : null;
      return {
        id: tempId,
        descricao: p.descricao,
        categoria: p.categoria,
        valor: p.valor,
        data: p.data,
        producaoId: p.producaoId,
        observacao: p.observacao,
        producao: prod ? { id: prod.id, cultura: prod.cultura } : null,
      };
    },
    applyUpdate: (item, p) => ({
      ...item,
      descricao: p.descricao,
      categoria: p.categoria,
      valor: p.valor,
      data: p.data,
      producaoId: p.producaoId,
      observacao: p.observacao,
    }),
  });

  // Vendas
  registerEntity<Venda, VendaPayload>(qc, {
    key: "vendas",
    endpoint: "/api/vendas",
    extraInvalidate: ["dashboard"],
    messages: {
      created: "Venda registrada.",
      updated: "Venda atualizada.",
      removed: "Venda excluída.",
    },
    hasUpdate: true,
    hasRemove: true,
    buildOptimistic: (p, tempId, client) => {
      const clientes =
        client.getQueryData<{ id: string; nome: string }[]>(["clientes"]) ?? [];
      const cli = p.clienteId ? clientes.find((c) => c.id === p.clienteId) : null;
      return {
        id: tempId,
        produto: p.produto,
        quantidade: p.quantidade,
        unidade: p.unidade,
        valorUnitario: p.valorUnitario,
        valorTotal: (p.quantidade || 0) * (p.valorUnitario || 0),
        data: p.data,
        formaPagamento: p.formaPagamento,
        clienteId: p.clienteId,
        observacao: p.observacao,
        cliente: cli ? { id: cli.id, nome: cli.nome } : null,
      };
    },
    applyUpdate: (item, p) => ({
      ...item,
      produto: p.produto,
      quantidade: p.quantidade,
      unidade: p.unidade,
      valorUnitario: p.valorUnitario,
      valorTotal: (p.quantidade || 0) * (p.valorUnitario || 0),
      data: p.data,
      formaPagamento: p.formaPagamento,
      clienteId: p.clienteId,
      observacao: p.observacao,
    }),
  });

  // Produção
  registerEntity<Producao, ProducaoPayload>(qc, {
    key: "producoes",
    endpoint: "/api/producoes",
    extraInvalidate: ["dashboard"],
    messages: {
      created: "Produção registrada.",
      updated: "Produção atualizada.",
      removed: "Produção excluída.",
    },
    hasUpdate: true,
    hasRemove: true,
    buildOptimistic: (p, tempId) => ({
      id: tempId,
      cultura: p.cultura,
      variedade: p.variedade,
      areaHa: p.areaHa,
      dataPlantio: p.dataPlantio,
      dataColheitaPrevista: p.dataColheitaPrevista,
      dataColheita: p.dataColheita,
      quantidadeColhida: p.quantidadeColhida,
      unidade: p.unidade,
      status: p.status,
      observacao: p.observacao,
    }),
    applyUpdate: (item, p) => ({ ...item, ...p }),
  });

  // Clientes (apenas criação — usado no cadastro rápido dentro da venda)
  registerEntity<Cliente, ClientePayload>(qc, {
    key: "clientes",
    endpoint: "/api/clientes",
    messages: {}, // sem toast (cadastro silencioso)
    buildOptimistic: (p, tempId) => ({
      id: tempId,
      nome: p.nome,
      telefone: p.telefone ?? null,
    }),
  });
}
