/* Rótulos e opções de domínio — em pt-BR, linguagem simples para o agricultor. */

export const CATEGORIA_DESPESA = {
  SEMENTE: "Semente",
  FERTILIZANTE: "Fertilizante",
  DEFENSIVO: "Defensivo",
  MAO_DE_OBRA: "Mão de obra",
  COMBUSTIVEL: "Combustível",
  MAQUINARIO: "Maquinário",
  TRANSPORTE: "Transporte",
  ENERGIA: "Energia",
  AGUA: "Água",
  MANUTENCAO: "Manutenção",
  OUTRO: "Outro",
} as const;

export type CategoriaDespesa = keyof typeof CATEGORIA_DESPESA;

export const STATUS_PRODUCAO = {
  PLANTADO: "Plantado",
  EM_CRESCIMENTO: "Em crescimento",
  COLHIDO: "Colhido",
  PERDIDO: "Perdido",
} as const;

export type StatusProducao = keyof typeof STATUS_PRODUCAO;

/** Cor (token do tema) para o badge de cada status de produção. */
export const STATUS_PRODUCAO_COR: Record<StatusProducao, string> = {
  PLANTADO: "bg-info/10 text-info",
  EM_CRESCIMENTO: "bg-accent text-accent-foreground",
  COLHIDO: "bg-primary/10 text-primary",
  PERDIDO: "bg-destructive/10 text-destructive",
};

export const FORMA_PAGAMENTO = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO: "Cartão",
  BOLETO: "Boleto",
  PRAZO: "A prazo",
} as const;

export type FormaPagamento = keyof typeof FORMA_PAGAMENTO;

export const UNIDADES_MEDIDA = [
  "sacas",
  "kg",
  "ton",
  "caixas",
  "litros",
  "dúzias",
  "unidades",
] as const;

/** Culturas comuns na agricultura familiar — sugestões nos formulários. */
export const CULTURAS_COMUNS = [
  "Milho",
  "Feijão",
  "Soja",
  "Mandioca",
  "Arroz",
  "Café",
  "Tomate",
  "Cebola",
  "Alface",
  "Banana",
  "Mamão",
  "Hortaliças",
  "Cana-de-açúcar",
  "Abóbora",
  "Melancia",
] as const;

/** Converte um objeto de rótulos em lista {value,label} para selects. */
export function toOptions<T extends Record<string, string>>(
  obj: T
): { value: keyof T & string; label: string }[] {
  return Object.entries(obj).map(([value, label]) => ({
    value: value as keyof T & string,
    label,
  }));
}
