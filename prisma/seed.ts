import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** Data N meses atrás, no dia informado (meio-dia local). */
function mesAtras(n: number, dia: number) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - n, dia, 12, 0, 0);
}

async function main() {
  const email = "joao@exemplo.com";
  const senha = await bcryptjs.hash("123456", 10);

  // Conta demo + propriedade
  let user = await prisma.user.findUnique({ where: { email }, include: { propriedade: true } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        nome: "João da Silva",
        email,
        senha,
        telefone: "(89) 99999-0000",
        propriedade: {
          create: {
            nome: "Sítio Boa Esperança",
            municipio: "Sebastião Leal",
            uf: "PI",
            areaHa: 25,
            atividadePrincipal: "Grãos e hortaliças",
          },
        },
      },
      include: { propriedade: true },
    });
  }
  const propriedadeId = user.propriedade!.id;

  // Limpa dados demo anteriores (idempotente)
  await prisma.venda.deleteMany({ where: { propriedadeId } });
  await prisma.despesa.deleteMany({ where: { propriedadeId } });
  await prisma.cliente.deleteMany({ where: { propriedadeId } });
  await prisma.producao.deleteMany({ where: { propriedadeId } });

  // Produções
  const milho = await prisma.producao.create({
    data: {
      propriedadeId,
      cultura: "Milho",
      variedade: "BRS 1055",
      areaHa: 10,
      dataPlantio: mesAtras(5, 10),
      dataColheita: mesAtras(1, 15),
      quantidadeColhida: 1200,
      unidade: "sacas",
      status: "COLHIDO",
    },
  });
  await prisma.producao.create({
    data: {
      propriedadeId,
      cultura: "Feijão",
      areaHa: 5,
      dataPlantio: mesAtras(2, 5),
      dataColheitaPrevista: mesAtras(-1, 20),
      status: "EM_CRESCIMENTO",
    },
  });
  await prisma.producao.create({
    data: {
      propriedadeId,
      cultura: "Mandioca",
      areaHa: 4,
      dataPlantio: mesAtras(1, 8),
      status: "PLANTADO",
    },
  });
  const tomate = await prisma.producao.create({
    data: {
      propriedadeId,
      cultura: "Tomate",
      areaHa: 1,
      dataPlantio: mesAtras(4, 2),
      dataColheita: mesAtras(1, 25),
      quantidadeColhida: 300,
      unidade: "caixas",
      status: "COLHIDO",
    },
  });

  // Clientes
  const [merc, coop, feira] = await Promise.all([
    prisma.cliente.create({ data: { propriedadeId, nome: "Mercado do Zé", telefone: "(89) 98888-1111" } }),
    prisma.cliente.create({ data: { propriedadeId, nome: "Cooperativa Local", telefone: "(89) 97777-2222" } }),
    prisma.cliente.create({ data: { propriedadeId, nome: "Feira da Cidade" } }),
  ]);

  // Despesas (espalhadas pelos últimos 6 meses)
  const despesas: { descricao: string; categoria: string; valor: number; data: Date; producaoId?: string }[] = [
    { descricao: "Sementes de milho", categoria: "SEMENTE", valor: 3200, data: mesAtras(5, 8), producaoId: milho.id },
    { descricao: "Adubo NPK", categoria: "FERTILIZANTE", valor: 4500, data: mesAtras(5, 12), producaoId: milho.id },
    { descricao: "Diesel - trator", categoria: "COMBUSTIVEL", valor: 1800, data: mesAtras(4, 3) },
    { descricao: "Diária de trabalhadores", categoria: "MAO_DE_OBRA", valor: 2400, data: mesAtras(4, 18) },
    { descricao: "Defensivo agrícola", categoria: "DEFENSIVO", valor: 1500, data: mesAtras(3, 7), producaoId: milho.id },
    { descricao: "Mudas de tomate", categoria: "SEMENTE", valor: 600, data: mesAtras(4, 2), producaoId: tomate.id },
    { descricao: "Conta de energia (bomba)", categoria: "ENERGIA", valor: 420, data: mesAtras(2, 10) },
    { descricao: "Manutenção do trator", categoria: "MANUTENCAO", valor: 950, data: mesAtras(2, 22) },
    { descricao: "Frete da colheita", categoria: "TRANSPORTE", valor: 800, data: mesAtras(1, 16) },
    { descricao: "Sementes de feijão", categoria: "SEMENTE", valor: 700, data: mesAtras(2, 5) },
    { descricao: "Diária de colheita", categoria: "MAO_DE_OBRA", valor: 1600, data: mesAtras(1, 14) },
    { descricao: "Diesel - colheita", categoria: "COMBUSTIVEL", valor: 1100, data: mesAtras(0, 4) },
    { descricao: "Adubo foliar", categoria: "FERTILIZANTE", valor: 900, data: mesAtras(0, 9) },
  ];
  await prisma.despesa.createMany({
    data: despesas.map((d) => ({ propriedadeId, ...d, categoria: d.categoria as never })),
  });

  // Vendas (espalhadas pelos últimos meses)
  const vendas = [
    { produto: "Tomate", quantidade: 150, unidade: "caixas", valorUnitario: 45, data: mesAtras(1, 26), formaPagamento: "PIX", clienteId: feira.id },
    { produto: "Tomate", quantidade: 150, unidade: "caixas", valorUnitario: 42, data: mesAtras(1, 28), formaPagamento: "DINHEIRO", clienteId: merc.id },
    { produto: "Milho", quantidade: 600, unidade: "sacas", valorUnitario: 70, data: mesAtras(1, 18), formaPagamento: "BOLETO", clienteId: coop.id },
    { produto: "Milho", quantidade: 400, unidade: "sacas", valorUnitario: 72, data: mesAtras(0, 6), formaPagamento: "PIX", clienteId: coop.id },
    { produto: "Milho", quantidade: 200, unidade: "sacas", valorUnitario: 68, data: mesAtras(0, 12), formaPagamento: "DINHEIRO", clienteId: merc.id },
  ];
  for (const v of vendas) {
    await prisma.venda.create({
      data: {
        propriedadeId,
        produto: v.produto,
        quantidade: v.quantidade,
        unidade: v.unidade,
        valorUnitario: v.valorUnitario,
        valorTotal: v.quantidade * v.valorUnitario,
        data: v.data,
        formaPagamento: v.formaPagamento as never,
        clienteId: v.clienteId,
      },
    });
  }

  console.log("✅ Seed concluído!");
  console.log("   Login demo: joao@exemplo.com / senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
