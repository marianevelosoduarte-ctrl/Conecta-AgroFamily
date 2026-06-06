"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  ShoppingCart,
  Pencil,
  Trash2,
  TrendingUp,
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
import { FORMA_PAGAMENTO, UNIDADES_MEDIDA, toOptions } from "@/lib/constants";
import { formatBRL, formatNumber } from "@/lib/utils";
import {
  useVendas,
  useClientes,
  useVendaMutations,
  useCreateCliente,
} from "@/features/vendas/hooks";
import { EMPTY_VENDA, type Venda, type VendaFormValues } from "@/features/vendas/types";

const PAGAMENTO_OPTIONS = toOptions(FORMA_PAGAMENTO);

export function VendasClient() {
  const { data: vendas = [], isLoading } = useVendas();
  const { data: clientes = [] } = useClientes();
  const { create, update, remove } = useVendaMutations();
  const createCliente = useCreateCliente();

  const [ym, setYm] = useState<YearMonth | null>(thisMonth());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VendaFormValues>(EMPTY_VENDA);
  const [novoCliente, setNovoCliente] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Venda | null>(null);

  const set = <K extends keyof VendaFormValues>(k: K, v: VendaFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const lista = useMemo(
    () => vendas.filter((v) => ym === null || isSameMonth(v.data, ym)),
    [vendas, ym]
  );

  const kpis = useMemo(() => {
    let total = 0;
    let periodo = 0;
    for (const v of vendas) {
      total += v.valorTotal;
      if (ym === null || isSameMonth(v.data, ym)) periodo += v.valorTotal;
    }
    return { total, periodo, count: lista.length };
  }, [vendas, ym, lista]);

  const totalPreview = useMemo(() => {
    const q = parseFloat(String(form.quantidade).replace(",", ".")) || 0;
    const u = parseFloat(String(form.valorUnitario).replace(",", ".")) || 0;
    return q * u;
  }, [form.quantidade, form.valorUnitario]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_VENDA);
    setNovoCliente("");
    setOpen(true);
  }

  function openEdit(v: Venda) {
    setEditingId(v.id);
    setForm({
      produto: v.produto,
      quantidade: String(v.quantidade),
      unidade: v.unidade || "sacas",
      valorUnitario: String(v.valorUnitario),
      data: v.data.slice(0, 10),
      formaPagamento: v.formaPagamento,
      clienteId: v.clienteId || "",
      observacao: v.observacao || "",
    });
    setNovoCliente("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let formToSave = form;

    // Cadastro rápido de cliente novo
    if (form.clienteId === "new" && novoCliente.trim()) {
      try {
        const c = await createCliente.mutateAsync({ nome: novoCliente.trim() });
        formToSave = { ...form, clienteId: c.id };
      } catch {
        return;
      }
    } else if (form.clienteId === "new") {
      formToSave = { ...form, clienteId: "" };
    }

    const onDone = { onSuccess: () => setOpen(false) };
    if (editingId) update.mutate({ id: editingId, form: formToSave }, onDone);
    else create.mutate(formToSave, onDone);
  }

  const saving = create.isPending || update.isPending || createCliente.isPending;

  return (
    <div>
      <PageHeader
        title="Vendas"
        description="Registre o que você vendeu e para quem"
        action={
          <Button onClick={openNew}>
            <Plus className="h-5 w-5" />
            Nova venda
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total vendido (geral)"
          value={formatBRL(kpis.total)}
          icon={TrendingUp}
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          title={ym ? "Vendas no mês" : "Vendas no período"}
          value={formatBRL(kpis.periodo)}
          icon={CalendarDays}
          iconClass="bg-success/10 text-success"
        />
        <KpiCard
          title="Nº de vendas"
          value={String(kpis.count)}
          icon={Hash}
          iconClass="bg-info/10 text-info"
        />
      </div>

      <div className="mb-4">
        <MonthPicker value={ym} onChange={setYm} />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando...</p>
      ) : vendas.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma venda registrada"
          description="Comece registrando suas vendas para acompanhar sua receita."
          action={
            <Button onClick={openNew}>
              <Plus className="h-5 w-5" />
              Registrar primeira venda
            </Button>
          }
        />
      ) : lista.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Nenhuma venda {ym ? "neste mês" : "registrada"}.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {v.produto}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {formatNumber(v.quantidade, 0)} {v.unidade}
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{FORMA_PAGAMENTO[v.formaPagamento]}</Badge>
                  <span>{new Date(v.data).toLocaleDateString("pt-BR")}</span>
                  {v.cliente && <span>· {v.cliente.nome}</span>}
                </div>
              </div>
              <p className="shrink-0 font-bold text-success">+ {formatBRL(v.valorTotal)}</p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(v)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar venda" : "Nova venda"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                required
                placeholder="Ex: Milho"
                value={form.produto}
                onChange={(e) => set("produto", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qtd">Qtd.</Label>
                <Input
                  id="qtd"
                  required
                  inputMode="decimal"
                  placeholder="0"
                  value={form.quantidade}
                  onChange={(e) => set("quantidade", e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="unit">Preço un. (R$)</Label>
                <Input
                  id="unit"
                  required
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.valorUnitario}
                  onChange={(e) => set("valorUnitario", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground">
              Total da venda: {formatBRL(totalPreview)}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-2">
                <Label>Pagamento</Label>
                <Select
                  value={form.formaPagamento}
                  onValueChange={(v) => set("formaPagamento", v as VendaFormValues["formaPagamento"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGAMENTO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <Select
                value={form.clienteId || "none"}
                onValueChange={(v) => set("clienteId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Cadastrar novo cliente</SelectItem>
                </SelectContent>
              </Select>
              {form.clienteId === "new" && (
                <Input
                  placeholder="Nome do novo cliente"
                  value={novoCliente}
                  onChange={(e) => setNovoCliente(e.target.value)}
                />
              )}
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
        title="Excluir venda?"
        description={deleteTarget ? `Venda de "${deleteTarget.produto}" será removida.` : ""}
        loading={remove.isPending}
        onConfirm={() =>
          deleteTarget &&
          remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  );
}
