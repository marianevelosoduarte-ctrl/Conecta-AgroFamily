import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/* ————————————————————————————————————————————
   Auto-cadastro do agricultor. Cria a conta (User) + a Propriedade
   numa tacada só — depois disso ele já entra direto no painel.
   ———————————————————————————————————————————— */

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa de ao menos 6 caracteres"),
  telefone: z.string().optional(),
  propriedadeNome: z.string().min(2, "Informe o nome da propriedade"),
  municipio: z.string().optional(),
  uf: z.string().optional(),
  areaHa: z.number().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const { nome, email, senha, telefone, propriedadeNome, municipio, uf, areaHa } =
      parsed.data;
    const emailNorm = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta com esse e-mail" },
        { status: 409 }
      );
    }

    const hash = await bcryptjs.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: emailNorm,
        senha: hash,
        telefone: telefone?.trim() || null,
        propriedade: {
          create: {
            nome: propriedadeNome.trim(),
            municipio: municipio?.trim() || null,
            uf: uf?.trim()?.toUpperCase() || null,
            areaHa: areaHa ?? null,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
