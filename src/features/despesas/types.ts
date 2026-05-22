import type { CategoriaDespesa } from "@/lib/constants";

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  producaoId: string | null;
  observacao: string | null;
  producao?: { id: string; cultura: string } | null;
}

export interface DespesaFormValues {
  descricao: string;
  categoria: CategoriaDespesa;
  valor: string;
  data: string;
  producaoId: string;
  observacao: string;
}

export const EMPTY_DESPESA: DespesaFormValues = {
  descricao: "",
  categoria: "OUTRO",
  valor: "",
  data: new Date().toISOString().slice(0, 10),
  producaoId: "",
  observacao: "",
};
