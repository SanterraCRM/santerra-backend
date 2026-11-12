import { Prisma, PrismaClient } from "@prisma/client";

const products: Prisma.ProductCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Pesticida A",
    description: "Pesticida fictício para testar funcionalidade.",
    price: 100.50,
    costPrice: 80.00,
    manufacturerId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Semente de Milho A",
    description: "Semente fictícia para testar funcionalidade.",
    price: 50.00,
    costPrice: 30.00,
    manufacturerId: "00000000-0000-4000-a000-000000000002",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Fertilizante A",
    description: "Fertilizante fictício para testar funcionalidade.",
    price: 75.00,
    costPrice: 60.00,
    manufacturerId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "BASF (excluída)",
    description: "Produto com soft delete, não deve aparecer nas listagens.",
    price: 200.00,
    costPrice: 150.00,
    manufacturerId: "00000000-0000-4000-a000-000000000003",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedProducts(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Produtos: ${count} criado(s), ${products.length - count} já existia(m).`,
  );
}
