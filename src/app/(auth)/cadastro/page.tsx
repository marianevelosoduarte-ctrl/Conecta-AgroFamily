"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, Tractor, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    propriedadeNome: "",
    municipio: "",
    uf: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast.error((await res.json()).error || "Erro ao criar conta.");
        return;
      }
      // Já loga e entra no painel
      await signIn("credentials", {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });
      toast.success("Conta criada! Bem-vindo ao Conecta Agrofamily 🌱");
      router.push("/inicio");
      router.refresh();
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Logo size={44} className="mb-4 lg:hidden" />
        <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="text-muted-foreground">É rápido e gratuito. Vamos começar!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Seus dados
          </p>
          <Field icon={User} placeholder="Seu nome" value={form.nome} onChange={(v) => set("nome", v)} required />
          <Field icon={Mail} type="email" placeholder="seu@email.com" value={form.email} onChange={(v) => set("email", v)} required />
          <Field icon={Lock} type="password" placeholder="Crie uma senha (mín. 6)" value={form.senha} onChange={(v) => set("senha", v)} required />
          <Field icon={Phone} placeholder="Telefone (opcional)" value={form.telefone} onChange={(v) => set("telefone", v)} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sua propriedade
          </p>
          <Field icon={Tractor} placeholder="Nome da propriedade (ex: Sítio Boa Vista)" value={form.propriedadeNome} onChange={(v) => set("propriedadeNome", v)} required />
          <div className="flex gap-3">
            <div className="flex-1">
              <Field icon={MapPin} placeholder="Município" value={form.municipio} onChange={(v) => set("municipio", v)} />
            </div>
            <Input
              placeholder="UF"
              maxLength={2}
              value={form.uf}
              onChange={(e) => set("uf", e.target.value.toUpperCase())}
              className="h-12 w-20 text-center uppercase"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="h-12 w-full text-base font-semibold">
          {loading ? "Criando..." : "Criar minha conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Field({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-11"
      />
    </div>
  );
}
