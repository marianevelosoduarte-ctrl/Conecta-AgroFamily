import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { PwaRegister } from "@/components/providers/pwa-register";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Conecta Agrofamily — Gestão Inteligente para o Campo",
  description:
    "Plataforma de gestão rural para agricultores familiares: controle de produção, finanças e vendas em um só lugar.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agrofamily",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F7A3D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
            <PwaRegister />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
