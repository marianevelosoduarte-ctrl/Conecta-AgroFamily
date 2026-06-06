"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

/* ————————————————————————————————————————————
   Navegador de mês (◀ Junho 2026 ▶) + botão "Tudo".
   Controlado: o pai guarda o estado e decide o que filtrar por ele.
   value = null significa "ver tudo" (sem filtro de mês).
   Por padrão não deixa avançar para meses futuros.
   ———————————————————————————————————————————— */

export type YearMonth = { year: number; month: number }; // month: 0-11

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Mês/ano atuais — ponto de partida padrão dos filtros. */
export function thisMonth(): YearMonth {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** Verifica se uma data (Date ou string ISO) cai no mês/ano informado. */
export function isSameMonth(date: string | Date, ym: YearMonth): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear() === ym.year && d.getMonth() === ym.month;
}

export function MonthPicker({
  value,
  onChange,
  allowFuture = false,
}: {
  value: YearMonth | null;
  onChange: (ym: YearMonth | null) => void;
  allowFuture?: boolean;
}) {
  const isAll = value === null;
  const base = value ?? thisMonth();

  const shift = (delta: number) => {
    const d = new Date(base.year, base.month + delta, 1);
    onChange({ year: d.getFullYear(), month: d.getMonth() });
  };

  const now = thisMonth();
  const isCurrent = base.year === now.year && base.month === now.month;
  const nextDisabled = isAll || (!allowFuture && isCurrent);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => shift(-1)}
          aria-label="Mês anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-36 text-center text-sm font-medium">
          {isAll ? "Todos os meses" : `${MESES[base.month]} ${base.year}`}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => shift(1)}
          disabled={nextDisabled}
          aria-label="Próximo mês"
        >
          <ChevronRight />
        </Button>
      </div>
      <Button
        variant={isAll ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(isAll ? thisMonth() : null)}
      >
        Tudo
      </Button>
    </div>
  );
}
