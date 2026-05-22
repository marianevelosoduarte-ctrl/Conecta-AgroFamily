import { Logo } from "@/components/brand/logo";
import { Leaf, TrendingUp, Wallet, Sprout } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Formulário */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Painel da marca (escondido no celular) */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{
          background:
            "linear-gradient(160deg, #1F7A3D 0%, #15602F 55%, #0F5B28 100%)",
        }}
      >
        <Logo size={48} showText textClassName="text-white text-xl" />

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-snug">
            Tecnologia que conecta o<br />campo e a família.
          </h2>
          <p className="max-w-sm text-white/85">
            Controle sua produção, suas finanças e suas vendas de um jeito
            simples — tudo em um só lugar.
          </p>
          <ul className="space-y-3 text-white/90">
            {[
              { icon: Sprout, label: "Acompanhe cada plantio" },
              { icon: Wallet, label: "Saiba para onde vai seu dinheiro" },
              { icon: TrendingUp, label: "Veja seu lucro de verdade" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-sm text-white/70">
          <Leaf className="h-4 w-4" />
          Juntos, cultivamos um futuro melhor.
        </p>
      </div>
    </div>
  );
}
