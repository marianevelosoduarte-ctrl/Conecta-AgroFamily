import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminApi } from "@/lib/api-auth";

// GET /api/admin/usuarios — lista todos os usuários (somente admin)
export async function GET() {
  const { authorized, response } = await checkAdminApi();
  if (!authorized) return response;

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      createdAt: true,
      propriedade: {
        select: { nome: true, municipio: true, uf: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(usuarios);
}
