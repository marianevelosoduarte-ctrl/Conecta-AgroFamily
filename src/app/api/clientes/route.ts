import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";

// GET /api/clientes — lista os clientes da propriedade
export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const clientes = await prisma.cliente.findMany({
    where: { propriedadeId, deletedAt: null },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(clientes);
}

// POST /api/clientes — cria um cliente
export async function POST(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  try {
    const body = await request.json();
    const { nome, telefone, observacao } = body;
    if (!nome) {
      return NextResponse.json({ error: "Informe o nome do cliente" }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        propriedadeId,
        nome: String(nome).trim(),
        telefone: telefone?.trim() || null,
        observacao: observacao?.trim() || null,
      },
    });
    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
