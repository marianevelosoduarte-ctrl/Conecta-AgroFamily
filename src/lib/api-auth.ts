import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/* ————————————————————————————————————————————
   Guard de rotas /api. Multi-tenant: garante usuário logado e retorna
   o propriedadeId da sessão. Todas as queries devem ser escopadas por
   esse propriedadeId — assim cada agricultor só acessa os próprios dados.
   ———————————————————————————————————————————— */

export async function checkApiAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
      session: null,
      propriedadeId: null,
    };
  }

  const propriedadeId = session.user.propriedadeId;
  if (!propriedadeId) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Nenhuma propriedade cadastrada" },
        { status: 403 }
      ),
      session,
      propriedadeId: null,
    };
  }

  return { authorized: true as const, response: null, session, propriedadeId };
}

/* Guard de rotas /api restritas a administradores. */
export async function checkAdminApi() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
      session: null,
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      ),
      session,
    };
  }

  return { authorized: true as const, response: null, session };
}
