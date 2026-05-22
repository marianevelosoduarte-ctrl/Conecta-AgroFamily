import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiAuth } from "@/lib/api-auth";
import { toDateSafe } from "@/lib/utils";

// GET /api/producoes — lista as produções da propriedade
export async function GET() {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const producoes = await prisma.producao.findMany({
    where: { propriedadeId, deletedAt: null },
    orderBy: [{ dataPlantio: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(producoes);
}

// POST /api/producoes — cria uma produção
export async function POST(request: NextRequest) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  try {
    const body = await request.json();
    const {
      cultura,
      variedade,
      areaHa,
      dataPlantio,
      dataColheitaPrevista,
      dataColheita,
      quantidadeColhida,
      unidade,
      status,
      observacao,
    } = body;

    if (!cultura) {
      return NextResponse.json({ error: "Informe a cultura" }, { status: 400 });
    }

    const producao = await prisma.producao.create({
      data: {
        propriedadeId,
        cultura: String(cultura).trim(),
        variedade: variedade?.trim() || null,
        areaHa: areaHa !== undefined && areaHa !== "" ? Number(areaHa) : null,
        dataPlantio: dataPlantio ? toDateSafe(dataPlantio) : null,
        dataColheitaPrevista: dataColheitaPrevista ? toDateSafe(dataColheitaPrevista) : null,
        dataColheita: dataColheita ? toDateSafe(dataColheita) : null,
        quantidadeColhida:
          quantidadeColhida !== undefined && quantidadeColhida !== ""
            ? Number(quantidadeColhida)
            : null,
        unidade: unidade || null,
        status: status || "PLANTADO",
        observacao: observacao?.trim() || null,
      },
    });

    return NextResponse.json(producao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produção:", error);
    return NextResponse.json({ error: "Erro ao criar produção" }, { status: 500 });
  }
}
