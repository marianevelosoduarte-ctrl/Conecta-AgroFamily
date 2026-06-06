"use client";

import { useMemo, useState } from "react";
import { onlineManager } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Sprout, Pencil, Trash2, Ruler, Wheat } from "lucide-react";
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
  STATUS_PRODUCAO,
  STATUS_PRODUCAO_COR,
  UNIDADES_MEDIDA,
  CULTURAS_COMUNS,
  toOptions,
} from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import { useProducoes, useProducaoMutations } from "@/features/producao/hooks";
import { EMPTY_PRODUCAO, type Producao, type ProducaoFormValues } from "@/features/producao/types";

const STATUS_OPTIONS = toOptions(STATUS_PRODUCAO);

export function ProducaoClient() {
  const { data: producoes = [], isLoading } = useProducoes();
  const { create, update, remove } = useProducaoMutations();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProducaoFormValues>(EMPTY_PRODUCAO);
  const [deleteTarget, setDeleteTarget] = useState<Producao | null>(null);

  const set = <K extends keyof ProducaoFormValues>(k: K, v: ProducaoFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const kpis = useMemo(() => {
    let area = 0;
    let colhidas = 0;
    for (const p of producoes) {
      area += p.areaHa || 0;
      if (p.status === "COLHIDO") colhidas++;
    }
    return { count: producoes.length, area, colhidas };
  }, [producoes]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_PRODUCAO);
    setOpen(true);
  }

  function openEdit(p: Producao) {
    setEditingId(p.id);
    setForm({
      cultura: p.cultura,
      variedade: p.variedade || "",
      areaHa: p.areaHa != null ? String(p.areaHa) : "",
      dataPlantio: p.dataPlantio?.slice(0, 10) || "",
      dataColheitaPrevista: p.dataColheitaPrevista?.slice(0, 10) || "",
      dataColheita: p.dataColheita?.slice(0, 10) || "",
      quantidadeColhida: p.quantidadeColhida != null ? String(p.quantidadeColhida) : "",
      unidade: p.unidade || "sacas",
      status: p.status,
      observacao: p.observacao || "",
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const offline = !onlineManager.isOnline();
    const onDone = { onSuccess: () => setOpen(false) };
    if (editingId) update.mutate({ id: editingId, form }, onDone);
    else create.mutate(form, onDone);
    if (offline) {
      setOpen(false);
      toast.success("Salvo no aparelho. Será enviado quando a internet voltar.");
    }
  }

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <PageHeader
        title="Produção"
        description="Acompanhe seus plantios e colheitas"
        action={
          <Button onClick={openNew}>
            <Plus className="h-5 w-5" />
            Nova produção
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Produções" value={String(kpis.count)} icon={Sprout} />
        <KpiCard
          title="Área plantada"
          value={`${formatNumber(kpis.area, 1)} ha`}
          icon={Ruler}
          iconClass="bg-info/10 text-info"
        />
        <KpiCard
          title="Colheitas concluídas"
          value={String(kpis.colhidas)}
          icon={Wheat}
          iconClass="bg-warning/10 text-warning"
        />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando...</p>
      ) : producoes.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Nenhuma produção cadastrada"
          description="Registre seus plantios para acompanhar a evolução até a colheita."
          action={
            <Button onClick={openNew}>
              <Plus className="h-5 w-5" />
              Registrar primeira produção
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {producoes.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sprout className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">{p.cultura}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_PRODUCAO_COR[p.status]
                      )}
                    >
                      {STATUS_PRODUCAO[p.status]}
                    </span>
                  </div>
                  {p.variedade && (
                    <p className="text-xs text-muted-foreground">{p.variedade}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {p.areaHa != null && <span>📐 {formatNumber(p.areaHa, 1)} ha</span>}
                    {p.dataPlantio && (
                      <span>🌱 {new Date(p.dataPlantio).toLocaleDateString("pt-BR")}</span>
                    )}
                    {p.quantidadeColhida != null && (
                      <span>
                        🌾 {formatNumber(p.quantidadeColhida, 0)} {p.unidade}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar produção" : "Nova produção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cultura">Cultura</Label>
                <Input
                  id="cultura"
                  required
                  list="culturas"
                  placeholder="Ex: Milho"
                  value={form.cultura}
                  onChange={(e) => set("cultura", e.target.value)}
                />
                <datalist id="culturas">
                  {CULTURAS_COMUNS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variedade">Variedade (opcional)</Label>
                <Input
                  id="variedade"
                  value={form.variedade}
                  onChange={(e) => set("variedade", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v as ProducaoFormValues["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área (hectares)</Label>
                <Input
                  id="area"
                  inputMode="decimal"
                  placeholder="0"
                  value={form.areaHa}
                  onChange={(e) => set("areaHa", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plantio">Data do plantio</Label>
                <Input
                  id="plantio"
                  type="date"
                  value={form.dataPlantio}
                  onChange={(e) => set("dataPlantio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prevista">Colheita prevista</Label>
                <Input
                  id="prevista"
                  type="date"
                  value={form.dataColheitaPrevista}
                  onChange={(e) => set("dataColheitaPrevista", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qtd">Quantidade colhida</Label>
                <Input
                  id="qtd"
                  inputMode="decimal"
                  placeholder="0"
                  value={form.quantidadeColhida}
                  onChange={(e) => set("quantidadeColhida", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={form.unidade} onValueChange={(v) => set("unidade", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
        title="Excluir produção?"
        description={deleteTarget ? `"${deleteTarget.cultura}" será removida.` : ""}
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const offline = !onlineManager.isOnline();
          remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          if (offline) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
