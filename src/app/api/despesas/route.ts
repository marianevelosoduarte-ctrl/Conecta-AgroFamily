import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { toDateSafe } from "@/lib/utils";

// GET /api/despesas — lista as despesas da propriedade (mais recentes primeiro)
export async function GET(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const sp = request.nextUrl.searchParams;
  const categoria = sp.get("categoria") || undefined;

  const despesas = await prisma.despesa.findMany({
    where: {
      propriedadeId,
      deletedAt: null,
      ...(categoria ? { categoria: categoria as never } : {}),
    },
    include: { producao: { select: { id: true, cultura: true } } },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(despesas);
}

// POST /api/despesas — cria uma despesa
export async function POST(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  try {
    const body = await request.json();
    const { descricao, categoria, valor, data, producaoId, observacao } = body;

    if (!descricao || valor === undefined || valor === null || !data) {
      return NextResponse.json(
        { error: "Descrição, valor e data são obrigatórios" },
        { status: 400 }
      );
    }

    const despesa = await prisma.despesa.create({
      data: {
        propriedadeId,
        descricao: String(descricao).trim(),
        categoria: categoria || "OUTRO",
        valor: Number(valor),
        data: toDateSafe(data),
        producaoId: producaoId || null,
        observacao: observacao?.trim() || null,
      },
      include: { producao: { select: { id: true, cultura: true } } },
    });

    return NextResponse.json(despesa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json({ error: "Erro ao criar despesa" }, { status: 500 });
  }
}
