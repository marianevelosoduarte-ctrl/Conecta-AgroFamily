import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const propriedade = session.user.propriedadeId
    ? await prisma.propriedade.findUnique({
        where: { id: session.user.propriedadeId },
        select: { nome: true },
      })
    : null;

  return (
    <AppShell
      userName={session.user.name || "Agricultor"}
      propriedadeNome={propriedade?.nome || "Minha propriedade"}
    >
      {children}
    </AppShell>
  );
}
