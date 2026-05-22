import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";

// GET /api/propriedade — dados da propriedade do usuário logado
export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const propriedade = await prisma.propriedade.findUnique({
    where: { id: propriedadeId },
    select: {
      id: true,
      nome: true,
      municipio: true,
      uf: true,
      areaHa: true,
      atividadePrincipal: true,
      user: { select: { nome: true, email: true, telefone: true } },
    },
  });
  return NextResponse.json(propriedade);
}

// PUT /api/propriedade — edita os dados da propriedade
export async function PUT(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  try {
    const body = await request.json();
    const { nome, municipio, uf, areaHa, atividadePrincipal } = body;

    const propriedade = await prisma.propriedade.update({
      where: { id: propriedadeId },
      data: {
        ...(nome !== undefined && { nome: String(nome).trim() }),
        ...(municipio !== undefined && {
          municipio: municipio?.trim() || null,
          // muda o município → recalcula as coordenadas do clima
          latitude: null,
          longitude: null,
        }),
        ...(uf !== undefined && { uf: uf?.trim()?.toUpperCase() || null }),
        ...(areaHa !== undefined && {
          areaHa: areaHa !== "" && areaHa != null ? Number(areaHa) : null,
        }),
        ...(atividadePrincipal !== undefined && {
          atividadePrincipal: atividadePrincipal?.trim() || null,
        }),
      },
      select: { id: true, nome: true, municipio: true, uf: true, areaHa: true, atividadePrincipal: true },
    });

    return NextResponse.json(propriedade);
  } catch (error) {
    console.error("Erro ao atualizar propriedade:", error);
    return NextResponse.json({ error: "Erro ao atualizar propriedade" }, { status: 500 });
  }
}
