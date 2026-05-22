"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/lib/utils";

const PALETTE = ["#1F7A3D", "#F5A623", "#1890FF", "#FDD835", "#8B6F47", "#52C41A", "#D32F2F", "#9333EA"];

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);

/** Receita x Despesa nos últimos 6 meses (área). */
export function ReceitaDespesaChart({
  data,
}: {
  data: { mes: string; receita: number; despesa: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1F7A3D" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#1F7A3D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F5A623" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F0" vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="#6B7280" />
        <YAxis tickFormatter={compact} tickLine={false} axisLine={false} fontSize={12} stroke="#6B7280" width={44} />
        <Tooltip
          formatter={(value, name) => [formatBRL(Number(value)), name === "receita" ? "Receita" : "Despesa"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 13 }}
        />
        <Legend
          formatter={(v) => (v === "receita" ? "Receita" : "Despesa")}
          iconType="circle"
          wrapperStyle={{ fontSize: 13 }}
        />
        <Area type="monotone" dataKey="receita" stroke="#1F7A3D" strokeWidth={2.5} fill="url(#gReceita)" />
        <Area type="monotone" dataKey="despesa" stroke="#F5A623" strokeWidth={2.5} fill="url(#gDespesa)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Distribuição das despesas por categoria (rosca). */
export function CategoriasChart({
  data,
}: {
  data: { nome: string; valor: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Sem despesas para mostrar ainda.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatBRL(Number(value))}
          contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 13 }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
