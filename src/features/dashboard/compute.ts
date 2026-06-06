import { CATEGORIA_DESPESA } from "@/lib/constants";
import type { Venda } from "@/features/vendas/types";
import type { Despesa } from "@/features/despesas/types";
import type { Producao } from "@/features/producao/types";

/* ————————————————————————————————————————————
   Cálculo do painel feito NO CLIENTE, a partir das listas já carregadas
   (vendas, despesas, produções). Antes isso vinha de /api/dashboard; agora
   é derivado localmente para o painel funcionar OFFLINE e refletir na hora
   os lançamentos feitos sem internet. Espelha a lógica do servidor.
   ———————————————————————————————————————————— */

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export interface DashboardData {
  receita: { total: number; mes: number };
  despesa: { total: number; mes: number };
  lucro: { total: number; mes: number };
  serie: { mes: string; receita: number; despesa: number }[];
  categorias: { nome: string; valor: number }[];
  producao: { total: number; ativas: number; area: number };
  contagem: { vendas: number; despesas: number };
}

export function computeDashboard(
  vendas: Venda[],
  despesas: Despesa[],
  producoes: Producao[]
): DashboardData {
  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const noMes = (d: Date) =>
    d.getMonth() === mesAtual && d.getFullYear() === anoAtual;

  let receitaTotal = 0;
  let receitaMes = 0;
  for (const v of vendas) {
    receitaTotal += v.valorTotal;
    if (noMes(new Date(v.data))) receitaMes += v.valorTotal;
  }

  let despesaTotal = 0;
  let despesaMes = 0;
  for (const d of despesas) {
    despesaTotal += d.valor;
    if (noMes(new Date(d.data))) despesaMes += d.valor;
  }

  // Série dos últimos 6 meses (receita x despesa)
  const serie: { mes: string; receita: number; despesa: number }[] = [];
  const buckets = new Map<string, { receita: number; despesa: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anoAtual, mesAtual - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, { receita: 0, despesa: 0 });
    serie.push({ mes: MESES[d.getMonth()], receita: 0, despesa: 0 });
  }
  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  for (const v of vendas) {
    const b = buckets.get(keyOf(new Date(v.data)));
    if (b) b.receita += v.valorTotal;
  }
  for (const de of despesas) {
    const b = buckets.get(keyOf(new Date(de.data)));
    if (b) b.despesa += de.valor;
  }
  let idx = 0;
  for (const [, val] of buckets) {
    serie[idx].receita = Math.round(val.receita);
    serie[idx].despesa = Math.round(val.despesa);
    idx++;
  }

  // Despesas por categoria (gráfico de pizza)
  const porCategoria = new Map<string, number>();
  for (const d of despesas) {
    porCategoria.set(d.categoria, (porCategoria.get(d.categoria) || 0) + d.valor);
  }
  const categorias = [...porCategoria.entries()]
    .map(([cat, valor]) => ({
      nome: CATEGORIA_DESPESA[cat as keyof typeof CATEGORIA_DESPESA] || cat,
      valor: Math.round(valor),
    }))
    .sort((a, b) => b.valor - a.valor);

  // Produção
  let areaPlantada = 0;
  let producoesAtivas = 0;
  for (const p of producoes) {
    areaPlantada += p.areaHa || 0;
    if (p.status === "PLANTADO" || p.status === "EM_CRESCIMENTO") producoesAtivas++;
  }

  return {
    receita: { total: receitaTotal, mes: receitaMes },
    despesa: { total: despesaTotal, mes: despesaMes },
    lucro: { total: receitaTotal - despesaTotal, mes: receitaMes - despesaMes },
    serie,
    categorias,
    producao: {
      total: producoes.length,
      ativas: producoesAtivas,
      area: areaPlantada,
    },
    contagem: { vendas: vendas.length, despesas: despesas.length },
  };
}
