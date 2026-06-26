"use client";

import {
  Area,
  AreaChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatBRL } from "@/lib/utils";

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);

/** Valor em R$ sem centavos (mais limpo nos rótulos). */
const brl0 = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

/** Rótulo do valor acima de cada ponto (esconde zeros pra não poluir). */
const valueLabel = (value: unknown) => {
  const n = Number(value);
  return n > 0 ? compact(n) : "";
};

/** Receita x Despesa nos últimos 6 meses (área). */
export function ReceitaDespesaChart({
  data,
}: {
  data: { mes: string; receita: number; despesa: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 28, right: 20, left: 12, bottom: 0 }}>
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
        <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="#6B7280" />
        <Tooltip
          formatter={(value, name) => [formatBRL(Number(value)), name === "receita" ? "Receita" : "Despesa"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 13 }}
        />
        <Legend
          formatter={(v) => (v === "receita" ? "Receita" : "Despesa")}
          iconType="circle"
          wrapperStyle={{ fontSize: 13 }}
        />
        <Area type="monotone" dataKey="receita" stroke="#1F7A3D" strokeWidth={2.5} fill="url(#gReceita)">
          <LabelList
            dataKey="receita"
            position="top"
            offset={10}
            formatter={valueLabel}
            fontSize={11}
            fontWeight={600}
            fill="#1F7A3D"
          />
        </Area>
        <Area type="monotone" dataKey="despesa" stroke="#F5A623" strokeWidth={2.5} fill="url(#gDespesa)">
          <LabelList
            dataKey="despesa"
            position="top"
            offset={10}
            formatter={valueLabel}
            fontSize={11}
            fontWeight={600}
            fill="#D98E0B"
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Despesas por categoria — ranking de barras (maior → menor). */
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

  // data já vem ordenado do maior pro menor (ver computeDashboard)
  const max = Math.max(...data.map((c) => c.valor));

  return (
    <div className="flex max-h-[280px] flex-col justify-center gap-2.5 overflow-y-auto pr-1">
      {data.map((c) => {
        // largura mínima de 4% pra categorias pequenas continuarem visíveis
        const pct = max > 0 ? Math.max((c.valor / max) * 100, 4) : 0;
        return (
          <div
            key={c.nome}
            className="grid grid-cols-[5.5rem_1fr] items-center gap-2"
          >
            <span
              className="truncate text-xs text-muted-foreground"
              title={c.nome}
            >
              {c.nome}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-5 flex-1 overflow-hidden rounded bg-muted/50">
                <div
                  className="h-full rounded"
                  style={{ width: `${pct}%`, backgroundColor: "#F5A623" }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                {brl0(c.valor)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
