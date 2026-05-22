"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Tractor, User, LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropData {
  nome: string;
  municipio: string | null;
  uf: string | null;
  areaHa: number | null;
  atividadePrincipal: string | null;
  user: { nome: string; email: string; telefone: string | null };
}

export default function AjustesPage() {
  const qc = useQueryClient();
  const { data } = useQuery<PropData>({
    queryKey: ["propriedade"],
    queryFn: async () => {
      const res = await fetch("/api/propriedade");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
  });

  const [form, setForm] = useState({ nome: "", municipio: "", uf: "", areaHa: "", atividadePrincipal: "" });

  useEffect(() => {
    if (data) {
      setForm({
        nome: data.nome || "",
        municipio: data.municipio || "",
        uf: data.uf || "",
        areaHa: data.areaHa != null ? String(data.areaHa) : "",
        atividadePrincipal: data.atividadePrincipal || "",
      });
    }
  }, [data]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/propriedade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, areaHa: form.areaHa || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Dados atualizados.");
      qc.invalidateQueries({ queryKey: ["propriedade"] });
      qc.invalidateQueries({ queryKey: ["clima"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Ajustes" description="Dados da sua conta e propriedade" />

      <div className="space-y-6">
        {/* Propriedade */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Tractor className="h-5 w-5 text-primary" />
            Minha propriedade
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da propriedade</Label>
              <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Input id="municipio" value={form.municipio} onChange={(e) => set("municipio", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  maxLength={2}
                  className="uppercase"
                  value={form.uf}
                  onChange={(e) => set("uf", e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="area">Área total (ha)</Label>
                <Input id="area" inputMode="decimal" value={form.areaHa} onChange={(e) => set("areaHa", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ativ">Atividade principal</Label>
                <Input id="ativ" value={form.atividadePrincipal} onChange={(e) => set("atividadePrincipal", e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O município é usado para mostrar a previsão do tempo da sua região.
            </p>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>

        {/* Conta */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <User className="h-5 w-5 text-primary" />
            Minha conta
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="Nome" value={data?.user.nome} />
            <Row label="E-mail" value={data?.user.email} />
            <Row label="Telefone" value={data?.user.telefone || "—"} />
          </dl>
          <Button
            variant="outline"
            className="mt-5 text-destructive hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
