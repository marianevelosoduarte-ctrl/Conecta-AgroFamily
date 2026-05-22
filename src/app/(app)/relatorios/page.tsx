"use client";

import { Printer, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatBRL, formatNumber, cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/hooks";
import { ReceitaDespesaChart, CategoriasChart } from "@/features/dashboard/charts";
import { BarChart3 } from "lucide-react";

export default function RelatoriosPage() {
  const { data, isLoading } = useDashboard();

  const totalDespesas = data?.despesa.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Visão geral do desempenho da sua propriedade"
        action={
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        }
      />

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando...</p>
      ) : !data || (data.contagem.vendas === 0 && data.contagem.despesas === 0) ? (
        <EmptyState
          icon={BarChart3}
          title="Ainda não há dados para o relatório"
          description="Registre vendas e despesas para gerar seus relatórios."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              title="Receita total"
              value={formatBRL(data.receita.total)}
              icon={TrendingUp}
              iconClass="bg-success/10 text-success"
            />
            <KpiCard
              title="Despesa total"
              value={formatBRL(data.despesa.total)}
              icon={Wallet}
              iconClass="bg-warning/10 text-warning"
            />
            <KpiCard
              title="Lucro"
              value={formatBRL(data.lucro.total)}
              icon={PiggyBank}
              iconClass={cn(
                data.lucro.total >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
              <h3 className="mb-4 font-semibold text-foreground">Receitas x Despesas (6 meses)</h3>
              <ReceitaDespesaChart data={data.serie} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">Despesas por categoria</h3>
              <CategoriasChart data={data.categorias} />
            </div>
          </div>

          {/* Tabela de categorias */}
          {data.categorias.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">Detalhe das despesas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Categoria</th>
                      <th className="pb-2 text-right font-medium">Valor</th>
                      <th className="pb-2 text-right font-medium">% do total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categorias.map((c) => (
                      <tr key={c.nome} className="border-b border-border last:border-0">
                        <td className="py-2 text-foreground">{c.nome}</td>
                        <td className="py-2 text-right font-medium text-foreground">{formatBRL(c.valor)}</td>
                        <td className="py-2 text-right text-muted-foreground">
                          {totalDespesas > 0 ? formatNumber((c.valor / totalDespesas) * 100, 1) : "0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
