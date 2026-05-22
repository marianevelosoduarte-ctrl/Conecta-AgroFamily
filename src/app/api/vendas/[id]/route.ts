import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { toDateSafe } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const { id } = await params;
  const existing = await prisma.venda.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true, quantidade: true, valorUnitario: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      produto,
      quantidade,
      unidade,
      valorUnitario,
      data,
      formaPagamento,
      clienteId,
      observacao,
    } = body;

    const qtd = quantidade !== undefined ? Number(quantidade) : existing.quantidade;
    const unit = valorUnitario !== undefined ? Number(valorUnitario) : existing.valorUnitario;

    const venda = await prisma.venda.update({
      where: { id },
      data: {
        ...(produto !== undefined && { produto: String(produto).trim() }),
        ...(quantidade !== undefined && { quantidade: qtd }),
        ...(unidade !== undefined && { unidade: unidade || null }),
        ...(valorUnitario !== undefined && { valorUnitario: unit }),
        // valorTotal sempre recalculado quando muda qtd ou valor
        ...((quantidade !== undefined || valorUnitario !== undefined) && {
          valorTotal: qtd * unit,
        }),
        ...(data !== undefined && { data: toDateSafe(data) }),
        ...(formaPagamento !== undefined && { formaPagamento }),
        ...(clienteId !== undefined && { clienteId: clienteId || null }),
        ...(observacao !== undefined && { observacao: observacao?.trim() || null }),
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });

    return NextResponse.json(venda);
  } catch (error) {
    console.error("Erro ao editar venda:", error);
    return NextResponse.json({ error: "Erro ao editar venda" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const { id } = await params;
  const existing = await prisma.venda.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  }

  await prisma.venda.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
