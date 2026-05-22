import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default function InicioPage() {
  return (
    <div>
      <PageHeader
        title="Início"
        description="Resumo da sua propriedade"
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground shadow-sm">
        Painel em construção 🌱
      </div>
    </div>
  );
}
