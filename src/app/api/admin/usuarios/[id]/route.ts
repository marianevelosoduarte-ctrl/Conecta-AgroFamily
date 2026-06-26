import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkAdminApi } from "@/lib/api-auth";

// PATCH /api/admin/usuarios/[id] — muda o papel e/ou redefine a senha
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, session } = await checkAdminApi();
  if (!authorized) return response;

  const { id } = await params;
  const alvo = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!alvo) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { role, novaSenha } = body;

  const data: { role?: "ADMIN" | "AGRICULTOR"; senha?: string } = {};

  if (role !== undefined) {
    if (role !== "ADMIN" && role !== "AGRICULTOR") {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 });
    }
    // Evita o admin se trancar pra fora rebaixando a própria conta.
    if (id === session!.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Você não pode rebaixar a própria conta." },
        { status: 400 }
      );
    }
    data.role = role;
  }

  if (novaSenha !== undefined) {
    if (typeof novaSenha !== "string" || novaSenha.trim().length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter ao menos 6 caracteres." },
        { status: 400 }
      );
    }
    data.senha = await bcryptjs.hash(novaSenha.trim(), 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  try {
    const atualizado = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true },
    });
    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

// DELETE /api/admin/usuarios/[id] — exclui o usuário (e todos os dados dele)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, session } = await checkAdminApi();
  if (!authorized) return response;

  const { id } = await params;
  if (id === session!.user.id) {
    return NextResponse.json(
      { error: "Você não pode excluir a própria conta." },
      { status: 400 }
    );
  }

  const alvo = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!alvo) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  try {
    // Cascade remove propriedade, produções, despesas, vendas e clientes.
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
