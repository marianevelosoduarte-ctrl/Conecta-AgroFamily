"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  ShieldCheck,
  Shield,
  KeyRound,
  Trash2,
  Sprout,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

const EMPTY_NOVO = {
  nome: "",
  email: "",
  senha: "",
  role: "AGRICULTOR" as "AGRICULTOR" | "ADMIN",
  propriedadeNome: "",
  telefone: "",
};

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: "ADMIN" | "AGRICULTOR";
  createdAt: string;
  propriedade: { nome: string; municipio: string | null; uf: string | null } | null;
}

export function UsuariosClient({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });

  const { data: usuarios = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin", "usuarios"],
    queryFn: async () => {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      return res.json();
    },
  });

  const setRole = useMutation<unknown, Error, { id: string; role: AdminUser["role"] }>({
    mutationFn: async ({ id, role }) => {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao alterar papel");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Papel atualizado.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetSenha = useMutation<unknown, Error, { id: string; novaSenha: string }>({
    mutationFn: async ({ id, novaSenha }) => {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao redefinir senha");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Senha redefinida.");
      setSenhaTarget(null);
      setNovaSenha("");
    },
    onError: (e) => toast.error(e.message),
  });

  const remover = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao excluir");
    },
    onSuccess: () => {
      toast.success("Usuário excluído.");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const criar = useMutation<unknown, Error, typeof EMPTY_NOVO>({
    mutationFn: async (form) => {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar usuário");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Usuário criado.");
      setNovoOpen(false);
      setNovo(EMPTY_NOVO);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const [senhaTarget, setSenhaTarget] = useState<AdminUser | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [novo, setNovo] = useState(EMPTY_NOVO);
  const setNovoField = <K extends keyof typeof EMPTY_NOVO>(
    k: K,
    v: (typeof EMPTY_NOVO)[K]
  ) => setNovo((f) => ({ ...f, [k]: v }));

  const stats = useMemo(() => {
    const admins = usuarios.filter((u) => u.role === "ADMIN").length;
    return { total: usuarios.length, admins, agricultores: usuarios.length - admins };
  }, [usuarios]);

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie as contas que acessam o sistema"
        action={
          <Button
            onClick={() => {
              setNovo(EMPTY_NOVO);
              setNovoOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
            Novo usuário
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total de contas" value={String(stats.total)} icon={Users} />
        <KpiCard
          title="Administradores"
          value={String(stats.admins)}
          icon={ShieldCheck}
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          title="Agricultores"
          value={String(stats.agricultores)}
          icon={Sprout}
          iconClass="bg-info/10 text-info"
        />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => {
            const ehVoce = u.id === currentUserId;
            const ehAdmin = u.role === "ADMIN";
            return (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {u.nome.charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">{u.nome}</p>
                    <Badge
                      variant="secondary"
                      className={
                        ehAdmin
                          ? "bg-primary/10 text-primary"
                          : "bg-info/10 text-info"
                      }
                    >
                      {ehAdmin ? "Admin" : "Agricultor"}
                    </Badge>
                    {ehVoce && (
                      <span className="text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {u.propriedade?.nome && <span>🏡 {u.propriedade.nome}</span>}
                    {u.telefone && <span>📞 {u.telefone}</span>}
                    <span>
                      Desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ehVoce || setRole.isPending}
                    title={ehVoce ? "Você não pode alterar o próprio papel" : undefined}
                    onClick={() =>
                      setRole.mutate({
                        id: u.id,
                        role: ehAdmin ? "AGRICULTOR" : "ADMIN",
                      })
                    }
                  >
                    {ehAdmin ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Tornar agricultor
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Tornar admin
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSenhaTarget(u);
                      setNovaSenha("");
                    }}
                  >
                    <KeyRound className="h-4 w-4" />
                    Senha
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={ehVoce}
                    title={ehVoce ? "Você não pode excluir a própria conta" : undefined}
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Novo usuário */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              criar.mutate(novo);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="n-nome">Nome</Label>
              <Input
                id="n-nome"
                required
                placeholder="Nome completo"
                value={novo.nome}
                onChange={(e) => setNovoField("nome", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="n-email">E-mail</Label>
              <Input
                id="n-email"
                type="email"
                required
                placeholder="email@exemplo.com"
                value={novo.email}
                onChange={(e) => setNovoField("email", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="n-senha">Senha</Label>
                <Input
                  id="n-senha"
                  type="text"
                  autoComplete="off"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={novo.senha}
                  onChange={(e) => setNovoField("senha", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select
                  value={novo.role}
                  onValueChange={(v) => setNovoField("role", v as "ADMIN" | "AGRICULTOR")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGRICULTOR">Agricultor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="n-prop">Propriedade (opcional)</Label>
                <Input
                  id="n-prop"
                  placeholder="Ex: Sítio São José"
                  value={novo.propriedadeNome}
                  onChange={(e) => setNovoField("propriedadeNome", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="n-tel">Telefone (opcional)</Label>
                <Input
                  id="n-tel"
                  placeholder="(00) 00000-0000"
                  value={novo.telefone}
                  onChange={(e) => setNovoField("telefone", e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNovoOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Redefinir senha */}
      <Dialog
        open={!!senhaTarget}
        onOpenChange={(o) => {
          if (!o) {
            setSenhaTarget(null);
            setNovaSenha("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (senhaTarget) resetSenha.mutate({ id: senhaTarget.id, novaSenha });
            }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Nova senha para <strong>{senhaTarget?.nome}</strong> ({senhaTarget?.email}).
            </p>
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova senha</Label>
              <Input
                id="novaSenha"
                type="text"
                autoComplete="off"
                minLength={6}
                required
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSenhaTarget(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={resetSenha.isPending}>
                {resetSenha.isPending ? "Salvando..." : "Redefinir"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Excluir usuário?"
        description={
          deleteTarget
            ? `A conta de "${deleteTarget.nome}" e TODOS os dados dela (produção, despesas, vendas) serão removidos. Esta ação não pode ser desfeita.`
            : ""
        }
        loading={remover.isPending}
        onConfirm={() => deleteTarget && remover.mutate(deleteTarget.id)}
      />
    </div>
  );
}
