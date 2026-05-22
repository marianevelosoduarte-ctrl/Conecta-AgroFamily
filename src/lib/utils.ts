import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número como moeda BRL (R$ 1.250,00). */
export function formatBRL(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata número com separador de milhar pt-BR. */
export function formatNumber(value: number | null | undefined, digits = 0): string {
  return (value ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Converte "YYYY-MM-DD" para Date no meio-dia local (evita shift de timezone). */
export function toDateSafe(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + "T12:00:00");
  }
  return new Date(value);
}
