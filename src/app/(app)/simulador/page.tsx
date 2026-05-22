"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp, TrendingDown, Sprout, Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatNumber, cn } from "@/lib/utils";

export default function SimuladorPage() {
  const [cultura, setCultura] = useState("Milho");
  const [area, setArea] = useState("10");
  const [produtividade, setProdutividade] = useState("120");
  const [precoUnit, setPrecoUnit] = useState("70");
  const [custoHa, setCustoHa] = useState("4500");

  const num = (s: string) => parseFloat(String(s).replace(",", ".")) || 0;

  const r = useMemo(() => {
    const a = num(area);
    const prod = num(produtividade);
    const preco = num(precoUnit);
    const custo = num(custoHa);

    const producaoTotal = a * prod; // sacas
    const receita = producaoTotal * preco;
    const custoTotal = a * custo;
    const lucro = receita - custoTotal;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;
    const lucroPorHa = a > 0 ? lucro / a : 0;
    return { producaoTotal, receita, custoTotal, lucro, margem, lucroPorHa };
  }, [area, produtividade, precoUnit, custoHa]);

  const lucroPositivo = r.lucro >= 0;

  return (
    <div>
      <PageHeader
        title="Simulador de Lucro"
        description="Estime o resultado da sua safra antes de plantar"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entradas */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-primary" />
            Dados da simulação
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cultura">Cultura</Label>
              <Input id="cultura" value={cultura} onChange={(e) => setCultura(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="area">Área (hectares)</Label>
                <Input id="area" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod">Produtividade (sacas/ha)</Label>
                <Input id="prod" inputMode="decimal" value={produtividade} onChange={(e) => setProdutividade(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço por saca (R$)</Label>
                <Input id="preco" inputMode="decimal" value={precoUnit} onChange={(e) => setPrecoUnit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo">Custo por hectare (R$)</Label>
                <Input id="custo" inputMode="decimal" value={custoHa} onChange={(e) => setCustoHa(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Dica: ajuste os valores conforme a realidade da sua região. Os números são uma estimativa.
            </p>
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-xl border p-6 text-center shadow-sm",
              lucroPositivo
                ? "border-primary/30 bg-primary/5"
                : "border-destructive/30 bg-destructive/5"
            )}
          >
            <p className="text-sm text-muted-foreground">Lucro estimado da safra</p>
            <p
              className={cn(
                "mt-1 text-4xl font-bold",
                lucroPositivo ? "text-primary" : "text-destructive"
              )}
            >
              {formatBRL(r.lucro)}
            </p>
            <Badge
              variant="secondary"
              className={cn(
                "mt-3",
                lucroPositivo ? "text-primary" : "text-destructive"
              )}
            >
              {lucroPositivo ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              Margem de {formatNumber(r.margem, 1)}%
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              title="Produção estimada"
              value={`${formatNumber(r.producaoTotal, 0)} sc`}
              icon={Sprout}
            />
            <KpiCard
              title="Receita estimada"
              value={formatBRL(r.receita)}
              icon={TrendingUp}
              iconClass="bg-success/10 text-success"
            />
            <KpiCard
              title="Custo total"
              value={formatBRL(r.custoTotal)}
              icon={Coins}
              iconClass="bg-warning/10 text-warning"
            />
            <KpiCard
              title="Lucro por hectare"
              value={formatBRL(r.lucroPorHa)}
              icon={TrendingUp}
              iconClass={lucroPositivo ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
