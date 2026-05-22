import type { StatusProducao } from "@/lib/constants";

export interface Producao {
  id: string;
  cultura: string;
  variedade: string | null;
  areaHa: number | null;
  dataPlantio: string | null;
  dataColheitaPrevista: string | null;
  dataColheita: string | null;
  quantidadeColhida: number | null;
  unidade: string | null;
  status: StatusProducao;
  observacao: string | null;
}

export interface ProducaoFormValues {
  cultura: string;
  variedade: string;
  areaHa: string;
  dataPlantio: string;
  dataColheitaPrevista: string;
  dataColheita: string;
  quantidadeColhida: string;
  unidade: string;
  status: StatusProducao;
  observacao: string;
}

export const EMPTY_PRODUCAO: ProducaoFormValues = {
  cultura: "",
  variedade: "",
  areaHa: "",
  dataPlantio: new Date().toISOString().slice(0, 10),
  dataColheitaPrevista: "",
  dataColheita: "",
  quantidadeColhida: "",
  unidade: "sacas",
  status: "PLANTADO",
  observacao: "",
};
