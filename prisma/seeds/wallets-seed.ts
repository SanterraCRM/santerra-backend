import { Prisma, PrismaClient } from "@prisma/client";

const wallets: Prisma.WalletCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    value: 5000.00,
    userCompanyId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    value: 1500.50,
    userCompanyId: "00000000-0000-4000-a000-000000000004",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    value: 3000.00,
    userCompanyId: "00000000-0000-4000-a000-000000000003",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    value: 0,
    userCompanyId: "00000000-0000-4000-a000-000000000002",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedWallets(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.wallet.createMany({
    data: wallets,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Carteiras: ${count} criada(s), ${wallets.length - count} já existia(m).`,
  );
}
