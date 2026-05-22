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
  const existing = await prisma.producao.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Produção não encontrada" }, { status: 404 });
  }

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

    const producao = await prisma.producao.update({
      where: { id },
      data: {
        ...(cultura !== undefined && { cultura: String(cultura).trim() }),
        ...(variedade !== undefined && { variedade: variedade?.trim() || null }),
        ...(areaHa !== undefined && { areaHa: areaHa !== "" ? Number(areaHa) : null }),
        ...(dataPlantio !== undefined && { dataPlantio: dataPlantio ? toDateSafe(dataPlantio) : null }),
        ...(dataColheitaPrevista !== undefined && {
          dataColheitaPrevista: dataColheitaPrevista ? toDateSafe(dataColheitaPrevista) : null,
        }),
        ...(dataColheita !== undefined && { dataColheita: dataColheita ? toDateSafe(dataColheita) : null }),
        ...(quantidadeColhida !== undefined && {
          quantidadeColhida: quantidadeColhida !== "" ? Number(quantidadeColhida) : null,
        }),
        ...(unidade !== undefined && { unidade: unidade || null }),
        ...(status !== undefined && { status }),
        ...(observacao !== undefined && { observacao: observacao?.trim() || null }),
      },
    });

    return NextResponse.json(producao);
  } catch (error) {
    console.error("Erro ao editar produção:", error);
    return NextResponse.json({ error: "Erro ao editar produção" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, propriedadeId } = await checkApiAuth();
  if (!authorized) return response;

  const { id } = await params;
  const existing = await prisma.producao.findFirst({
    where: { id, propriedadeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Produção não encontrada" }, { status: 404 });
  }

  await prisma.producao.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
