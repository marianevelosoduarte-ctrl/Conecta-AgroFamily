import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { toDateSafe } from "@/lib/utils";

// PUT /api/despesas/[id] — edita (somente se for da propriedade do usuário)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const { id } = await params;

  const existing = await prisma.despesa.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { descricao, categoria, valor, data, producaoId, observacao } = body;

    const despesa = await prisma.despesa.update({
      where: { id },
      data: {
        ...(descricao !== undefined && { descricao: String(descricao).trim() }),
        ...(categoria !== undefined && { categoria }),
        ...(valor !== undefined && { valor: Number(valor) }),
        ...(data !== undefined && { data: toDateSafe(data) }),
        ...(producaoId !== undefined && { producaoId: producaoId || null }),
        ...(observacao !== undefined && { observacao: observacao?.trim() || null }),
      },
      include: { producao: { select: { id: true, cultura: true } } },
    });

    return NextResponse.json(despesa);
  } catch (error) {
    console.error("Erro ao editar despesa:", error);
    return NextResponse.json({ error: "Erro ao editar despesa" }, { status: 500 });
  }
}

// DELETE /api/despesas/[id] — exclui (soft-delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const { id } = await params;

  const existing = await prisma.despesa.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
  }

  await prisma.despesa.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
