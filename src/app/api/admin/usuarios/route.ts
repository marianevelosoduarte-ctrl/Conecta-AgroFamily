import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { z } from "zod";
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

const novoUsuarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa de ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "AGRICULTOR"]).default("AGRICULTOR"),
  telefone: z.string().optional(),
  propriedadeNome: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().optional(),
});

// POST /api/admin/usuarios — cria uma conta (somente admin)
export async function POST(request: Request) {
  const { authorized, response } = await checkAdminApi();
  if (!authorized) return response;

  const parsed = novoUsuarioSchema.safeParse(await request.json());
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Dados inválidos";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const { nome, email, senha, role, telefone, propriedadeNome, municipio, uf } =
    parsed.data;
  const emailNorm = email.toLowerCase().trim();

  const existente = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existente) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail" },
      { status: 409 }
    );
  }

  try {
    const hash = await bcryptjs.hash(senha, 10);
    // Sempre cria uma propriedade (mesmo p/ admin) para as telas de dados
    // funcionarem sem erro; usa um nome padrão se não for informado.
    const user = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: emailNorm,
        senha: hash,
        role,
        telefone: telefone?.trim() || null,
        propriedade: {
          create: {
            nome: propriedadeNome?.trim() || "Minha propriedade",
            municipio: municipio?.trim() || null,
            uf: uf?.trim()?.toUpperCase() || null,
          },
        },
      },
      select: { id: true, nome: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
