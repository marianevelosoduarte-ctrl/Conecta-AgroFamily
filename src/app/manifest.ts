import type { MetadataRoute } from "next";

/* ————————————————————————————————————————————
   Manifesto PWA — permite instalar o Conecta Agrofamily como app
   na tela inicial do celular/computador. Next.js linka este arquivo
   automaticamente como /manifest.webmanifest.
   ———————————————————————————————————————————— */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conecta Agrofamily",
    short_name: "Agrofamily",
    description:
      "Gestão rural para agricultores familiares: produção, despesas, vendas e relatórios em um só lugar.",
    lang: "pt-BR",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1F7A3D",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
