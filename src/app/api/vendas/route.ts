import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { toDateSafe } from "@/lib/utils";

// GET /api/vendas — lista as vendas da propriedade
export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const vendas = await prisma.venda.findMany({
    where: { propriedadeId, deletedAt: null },
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { data: "desc" },
  });
  return NextResponse.json(vendas);
}

// POST /api/vendas — registra uma venda (valorTotal calculado no servidor)
export async function POST(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

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

    if (!produto || quantidade === undefined || valorUnitario === undefined || !data) {
      return NextResponse.json(
        { error: "Produto, quantidade, valor e data são obrigatórios" },
        { status: 400 }
      );
    }

    const qtd = Number(quantidade);
    const unit = Number(valorUnitario);

    const venda = await prisma.venda.create({
      data: {
        propriedadeId,
        produto: String(produto).trim(),
        quantidade: qtd,
        unidade: unidade || null,
        valorUnitario: unit,
        valorTotal: qtd * unit, // sempre derivado
        data: toDateSafe(data),
        formaPagamento: formaPagamento || "DINHEIRO",
        clienteId: clienteId || null,
        observacao: observacao?.trim() || null,
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json({ error: "Erro ao criar venda" }, { status: 500 });
  }
}
