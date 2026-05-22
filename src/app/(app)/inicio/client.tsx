"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Receipt,
  Sprout,
  ShoppingCart,
  Plus,
  PiggyBank,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { formatBRL, formatNumber, cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/hooks";
import { ReceitaDespesaChart, CategoriasChart } from "@/features/dashboard/charts";

export function DashboardClient() {
  const { data, isLoading } = useDashboard();

  const lucroTotal = data?.lucro.total ?? 0;
  const lucroPositivo = lucroTotal >= 0;

  return (
    <div>
      <PageHeader title="Início" description="O resumo da sua propriedade num só lugar" />

      {/* Atalhos rápidos */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction href="/vendas" icon={ShoppingCart} label="Registrar venda" tone="primary" />
        <QuickAction href="/despesas" icon={Receipt} label="Registrar gasto" tone="destructive" />
        <QuickAction href="/producao" icon={Sprout} label="Nova produção" tone="info" />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando seu painel...</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Saldo (lucro)"
              value={formatBRL(lucroTotal)}
              icon={PiggyBank}
              iconClass={cn(
                lucroPositivo ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}
              hint={lucroPositivo ? "Receitas maiores que despesas 🎉" : "Despesas maiores que receitas"}
            />
            <KpiCard
              title="Receitas (total)"
              value={formatBRL(data?.receita.total ?? 0)}
              icon={TrendingUp}
              iconClass="bg-success/10 text-success"
            />
            <KpiCard
              title="Despesas (total)"
              value={formatBRL(data?.despesa.total ?? 0)}
              icon={Wallet}
              iconClass="bg-warning/10 text-warning"
            />
            <KpiCard
              title="Produções ativas"
              value={`${data?.producao.ativas ?? 0} / ${data?.producao.total ?? 0}`}
              icon={Sprout}
              iconClass="bg-info/10 text-info"
              hint={`${formatNumber(data?.producao.area ?? 0, 1)} ha plantados`}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
              <h3 className="mb-1 font-semibold text-foreground">Receitas x Despesas</h3>
              <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses</p>
              <ReceitaDespesaChart data={data?.serie ?? []} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-1 font-semibold text-foreground">Onde vai o dinheiro</h3>
              <p className="mb-4 text-xs text-muted-foreground">Despesas por categoria</p>
              <CategoriasChart data={data?.categorias ?? []} />
            </div>
          </div>

          {/* Resultado do mês */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Resultado deste mês</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MesItem label="Recebido" value={data?.receita.mes ?? 0} tone="text-success" />
              <MesItem label="Gasto" value={data?.despesa.mes ?? 0} tone="text-destructive" />
              <MesItem label="Lucro" value={data?.lucro.mes ?? 0} tone="text-primary" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: typeof Wallet;
  label: string;
  tone: "primary" | "destructive" | "info";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }[tone];
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneClass)}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-medium text-foreground">{label}</span>
      <Plus className="ml-auto h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

function MesItem({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", tone)}>{formatBRL(value)}</p>
    </div>
  );
}
