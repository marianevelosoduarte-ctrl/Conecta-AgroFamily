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
