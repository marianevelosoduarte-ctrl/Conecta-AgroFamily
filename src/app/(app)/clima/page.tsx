"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

interface Clima {
  local: string;
  atual: { temperatura: number; umidade: number | null; vento: number; chuva: number; code: number };
  dias: { data: string; code: number; max: number; min: number; chuva: number | null }[];
}

function tempo(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Céu limpo", Icon: Sun };
  if (code <= 2) return { label: "Parcialmente nublado", Icon: CloudSun };
  if (code === 3) return { label: "Nublado", Icon: Cloud };
  if (code <= 48) return { label: "Névoa", Icon: CloudFog };
  if (code <= 57) return { label: "Garoa", Icon: CloudDrizzle };
  if (code <= 67) return { label: "Chuva", Icon: CloudRain };
  if (code <= 77) return { label: "Neve", Icon: CloudSnow };
  if (code <= 82) return { label: "Pancadas de chuva", Icon: CloudRain };
  if (code <= 86) return { label: "Neve", Icon: CloudSnow };
  return { label: "Tempestade", Icon: CloudLightning };
}

export default function ClimaPage() {
  const { data, isLoading, error } = useQuery<Clima>({
    queryKey: ["clima"],
    queryFn: async () => {
      const res = await fetch("/api/clima");
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao buscar o clima");
      return res.json();
    },
    staleTime: 30 * 60_000,
    retry: false,
  });

  return (
    <div>
      <PageHeader title="Clima" description="Previsão do tempo para a sua região" />

      {isLoading ? (
        <p className="py-10 text-center text-muted-foreground">Buscando a previsão...</p>
      ) : error ? (
        <EmptyState
          icon={CloudSun}
          title="Não foi possível mostrar o clima"
          description={(error as Error).message}
        />
      ) : data ? (
        <div className="space-y-6">
          {/* Clima atual */}
          <ClimaAtual data={data} />

          {/* Próximos dias */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Próximos dias</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {data.dias.map((d, i) => {
                const { Icon, label } = tempo(d.code);
                const dia =
                  i === 0
                    ? "Hoje"
                    : new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "short",
                      });
                return (
                  <div
                    key={d.data}
                    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3 text-center"
                  >
                    <span className="text-sm font-medium capitalize text-muted-foreground">{dia}</span>
                    <Icon className="my-1 h-8 w-8 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {d.max}° <span className="text-muted-foreground">/ {d.min}°</span>
                    </span>
                    {d.chuva != null && (
                      <span className="flex items-center gap-1 text-xs text-info">
                        <Droplets className="h-3 w-3" />
                        {d.chuva}%
                      </span>
                    )}
                    <span className="mt-1 text-[11px] text-muted-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClimaAtual({ data }: { data: Clima }) {
  const { Icon, label } = tempo(data.atual.code);
  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "linear-gradient(135deg, #1F7A3D 0%, #15602F 100%)" }}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-16 w-16" />
        <div>
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-4 w-4" />
            {data.local}
          </p>
          <p className="text-5xl font-bold">{data.atual.temperatura}°C</p>
          <p className="text-white/90">{label}</p>
        </div>
      </div>
      <div className="flex gap-6">
        {data.atual.umidade != null && (
          <Stat icon={Droplets} label="Umidade" value={`${data.atual.umidade}%`} />
        )}
        <Stat icon={Wind} label="Vento" value={`${data.atual.vento} km/h`} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-5 w-5 text-white/80" />
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
