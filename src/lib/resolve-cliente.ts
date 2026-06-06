import { prisma } from "@/lib/prisma";

/* ————————————————————————————————————————————
   Resolve o clienteId final de uma venda:
   - usa o id informado, quando houver (e não for um id temporário offline);
   - senão, se vier um nome ("novoClienteNome"), cria o cliente na hora.
   Isso permite cadastrar um cliente novo no mesmo request da venda,
   inclusive quando a venda foi feita offline e só agora está sincronizando.
   ———————————————————————————————————————————— */
export async function resolveClienteId(
  propriedadeId: string,
  clienteId: unknown,
  novoClienteNome: unknown
): Promise<string | null> {
  if (
    typeof clienteId === "string" &&
    clienteId &&
    !clienteId.startsWith("temp-")
  ) {
    return clienteId;
  }
  if (typeof novoClienteNome === "string" && novoClienteNome.trim()) {
    const novo = await prisma.cliente.create({
      data: { propriedadeId, nome: novoClienteNome.trim() },
    });
    return novo.id;
  }
  return null;
}
