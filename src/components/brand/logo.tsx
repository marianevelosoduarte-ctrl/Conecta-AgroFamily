import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Tamanho do emblema em px. */
  size?: number;
  /** Mostrar o texto "Conecta Agrofamily" ao lado. */
  showText?: boolean;
  /** Cor do texto (default herda). */
  className?: string;
  textClassName?: string;
}

export function Logo({
  size = 40,
  showText = true,
  className,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="Conecta Agrofamily"
        width={size}
        height={size}
        priority
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span
          className={cn(
            "font-bold leading-tight tracking-tight text-[var(--green-900)]",
            textClassName
          )}
        >
          Conecta <span className="text-primary">Agrofamily</span>
        </span>
      )}
    </div>
  );
}
