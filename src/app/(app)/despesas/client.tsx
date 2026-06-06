"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Receipt,
  Pencil,
  Trash2,
  Wallet,
  CalendarDays,
  Hash,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MonthPicker,
  thisMonth,
  isSameMonth,
  type YearMonth,
} from "@/components/ui/month-picker";
import { CATEGORIA_DESPESA, toOptions } from "@/lib/constants";
import { formatBRL } from "@/lib/utils";
import { useDespesas, useDespesaMutations } from "@/features/despesas/hooks";
import { EMPTY_DESPESA, type Despesa, type DespesaFormValues } from "@/features/despesas/types";

const CATEGORIA_OPTIONS = toOptions(CATEGORIA_DESPESA);

export function DespesasClient() {
  const { data: despesas = [], isLoading } = useDespesas();
  const { create, update, remove } = useDespesaMutations();

  const { data: producoes = [] } = useQuery<{ id: string; cultura: string }[]>({
    queryKey: ["producoes"],
    queryFn: async () => {
      const r = await fetch("/api/producoes");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const [filtro, setFiltro] = useState<string>("all");
  const [ym, setYm] = useState<YearMonth | null>(thisMonth());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DespesaFormValues>(EMPTY_DESPESA);
  const [deleteTarget, setDeleteTarget] = useState<Despesa | null>(null);

  const set = <K extends keyof DespesaFormValues>(k: K, v: DespesaFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const lista = useMemo(
    () =>
      despesas.filter(
        (d) =>
          (ym === null || isSameMonth(d.data, ym)) &&
          (filtro === "all" || d.categoria === filtro)
      ),
    [despesas, filtro, ym]
  );

  const kpis = useMemo(() => {
    let total = 0;
    let periodo = 0;
    for (const d of despesas) {
      total += d.valor;
      if (ym === null || isSameMonth(d.data, ym)) periodo += d.valor;
    }
    return { total, periodo, count: lista.length };
  }, [despesas, ym, lista]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_DESPESA);
    setOpen(true);
  }

  function openEdit(d: Despesa) {
    setEditingId(d.id);
    setForm({
      descricao: d.descricao,
      categoria: d.categoria,
      valor: String(d.valor),
      data: d.data.slice(0, 10),
      producaoId: d.producaoId || "",
      observacao: d.observacao || "",
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const onDone = { onSuccess: () => setOpen(false) };
    if (editingId) update.mutate({ id: editingId, form }, onDone);
    else create.mutate(form, onDone);
  }

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <PageHeader
        title="Despesas"
        description="Controle tudo o que você gasta na produção"
        action={
          <Button onClick={openNew}>
            <Plus className="h-5 w-5" />
            Nova despesa
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total gasto (geral)"
          value={formatBRL(kpis.total)}
          icon={Wallet}
          iconClass="bg-destructive/10 text-destructive"
        />
        <KpiCard
          title={ym ? "Gasto no mês" : "Gasto no período"}
          value={formatBRL(kpis.periodo)}
          icon={CalendarDays}
          iconClass="bg-warning/10 text-warning"
        />
        <KpiCard
          title="Lançamentos"
          value={String(kpis.count)}
          icon={Hash}
          iconClass="bg-primary/10 text-primary"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MonthPicker value={ym} onChange={setYm} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Categoria:</span>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIA_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando...</p>
      ) : despesas.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma despesa por aqui"
          description="Comece registrando seus gastos para acompanhar o custo da produção."
          action={
            <Button onClick={openNew}>
              <Plus className="h-5 w-5" />
              Registrar primeira despesa
            </Button>
          }
        />
      ) : lista.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Nenhuma despesa {ym ? "neste mês" : "com esse filtro"}.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Receipt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{d.descricao}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{CATEGORIA_DESPESA[d.categoria]}</Badge>
                  <span>{new Date(d.data).toLocaleDateString("pt-BR")}</span>
                  {d.producao && <span>· {d.producao.cultura}</span>}
                </div>
              </div>
              <p className="shrink-0 font-bold text-destructive">
                − {formatBRL(d.valor)}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(d)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                required
                placeholder="Ex: Compra de adubo"
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  required
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => set("valor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => set("data", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v as DespesaFormValues["categoria"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIA_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {producoes.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular a uma produção (opcional)</Label>
                <Select
                  value={form.producaoId || "none"}
                  onValueChange={(v) => set("producaoId", v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {producoes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.cultura}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="obs">Observação (opcional)</Label>
              <Textarea
                id="obs"
                rows={2}
                value={form.observacao}
                onChange={(e) => set("observacao", e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Excluir despesa?"
        description={deleteTarget ? `"${deleteTarget.descricao}" será removida.` : ""}
        loading={remove.isPending}
        onConfirm={() =>
          deleteTarget &&
          remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  );
}
