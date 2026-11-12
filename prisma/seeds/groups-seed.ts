import { Prisma, PrismaClient } from "@prisma/client";

const groups: Prisma.GroupCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Pesticidas",
    description: "Todos os tipos de pesticidas.",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Sementes",
    description: "Todos os tipos de sementes disponíveis.",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Fertilizantes",
    description: "Todos os tipos de fertilizantes disponíveis.",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Pesticida categoria B (excluída)",
    description: "Grupo com soft delete, não deve aparecer nas listagens.",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedGroups(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.group.createMany({
    data: groups,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Grupos: ${count} criado(s), ${groups.length - count} já existia(m).`,
  );
}
