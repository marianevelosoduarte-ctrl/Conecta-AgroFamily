import { requireAdmin } from "@/lib/auth-check";
import { UsuariosClient } from "./client";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const { session } = await requireAdmin();
  return <UsuariosClient currentUserId={session.user.id} />;
}
