import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/* Guard de Server Components / pages. Redireciona pro login se não autenticado. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return { session, propriedadeId: session.user.propriedadeId };
}

/* Guard de páginas restritas a administradores. Não-admin volta pro painel. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/inicio");
  return { session };
}
