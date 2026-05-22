import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { CATEGORIA_DESPESA } from "@/lib/constants";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// GET /api/dashboard — números agregados da propriedade (resumo financeiro)
export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const [vendas, despesas, producoes] = await Promise.all([
    prisma.venda.findMany({
      where: { propriedadeId, deletedAt: null },
      select: { valorTotal: true, data: true },
    }),
    prisma.despesa.findMany({
      where: { propriedadeId, deletedAt: null },
      select: { valor: true, data: true, categoria: true },
    }),
    prisma.producao.findMany({
      where: { propriedadeId, deletedAt: null },
      select: { status: true, areaHa: true },
    }),
  ]);

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const noMes = (d: Date) => d.getMonth() === mesAtual && d.getFullYear() === anoAtual;

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
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, { receita: 0, despesa: 0 });
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

  // Despesas por categoria (para o gráfico de pizza)
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

  return NextResponse.json({
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
  });
}
