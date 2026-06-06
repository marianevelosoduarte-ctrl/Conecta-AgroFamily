import type { FormaPagamento } from "@/lib/constants";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
}

export interface Venda {
  id: string;
  produto: string;
  quantidade: number;
  unidade: string | null;
  valorUnitario: number;
  valorTotal: number;
  data: string;
  formaPagamento: FormaPagamento;
  clienteId: string | null;
  observacao: string | null;
  cliente?: { id: string; nome: string } | null;
}

export interface VendaFormValues {
  produto: string;
  quantidade: string;
  unidade: string;
  valorUnitario: string;
  data: string;
  formaPagamento: FormaPagamento;
  clienteId: string;
  /** Nome de um cliente novo a cadastrar junto da venda (clienteId === "new"). */
  novoClienteNome?: string;
  observacao: string;
}

export const EMPTY_VENDA: VendaFormValues = {
  produto: "",
  quantidade: "",
  unidade: "sacas",
  valorUnitario: "",
  data: new Date().toISOString().slice(0, 10),
  formaPagamento: "DINHEIRO",
  clienteId: "",
  observacao: "",
};
