import { Prisma, PrismaClient } from "@prisma/client";

const SANTERRA = "00000000-0000-4000-a000-000000000001";
const VALE_VERDE = "00000000-0000-4000-a000-000000000002";
const SIPRIANO = "00000000-0000-4000-a000-000000000001";
const MARIA = "00000000-0000-4000-a000-000000000004";

const movements: Prisma.WalletMovementCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    walletId: "00000000-0000-4000-a000-000000000001",
    companyId: SANTERRA,
    type: "INITIAL_BALANCE",
    amount: 6000.0,
    balanceAfter: 6000.0,
    createdAt: new Date("2026-10-01T12:00:00Z"),
    createdById: SIPRIANO,
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    walletId: "00000000-0000-4000-a000-000000000001",
    companyId: SANTERRA,
    type: "ACTION_DEBIT",
    amount: -1000.0,
    balanceAfter: 5000.0,
    commercialActionId: "00000000-0000-4000-a000-000000000001",
    createdAt: new Date("2026-10-30T12:00:00Z"),
    createdById: SIPRIANO,
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    walletId: "00000000-0000-4000-a000-000000000002",
    companyId: SANTERRA,
    type: "INITIAL_BALANCE",
    amount: 2000.5,
    balanceAfter: 2000.5,
    createdAt: new Date("2026-10-01T12:00:00Z"),
    createdById: SIPRIANO,
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    walletId: "00000000-0000-4000-a000-000000000002",
    companyId: SANTERRA,
    type: "ACTION_DEBIT",
    amount: -500.0,
    balanceAfter: 1500.5,
    commercialActionId: "00000000-0000-4000-a000-000000000002",
    createdAt: new Date("2026-10-25T12:00:00Z"),
    createdById: SIPRIANO,
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    walletId: "00000000-0000-4000-a000-000000000003",
    companyId: VALE_VERDE,
    type: "INITIAL_BALANCE",
    amount: 3000.0,
    balanceAfter: 3000.0,
    createdAt: new Date("2026-10-01T12:00:00Z"),
    createdById: MARIA,
  },
  {
    id: "00000000-0000-4000-a000-000000000006",
    walletId: "00000000-0000-4000-a000-000000000003",
    companyId: VALE_VERDE,
    type: "ACTION_DEBIT",
    amount: -200.0,
    balanceAfter: 2800.0,
    commercialActionId: "00000000-0000-4000-a000-000000000003",
    createdAt: new Date("2026-10-20T12:00:00Z"),
    createdById: MARIA,
  },
  {
    id: "00000000-0000-4000-a000-000000000007",
    walletId: "00000000-0000-4000-a000-000000000003",
    companyId: VALE_VERDE,
    type: "ACTION_REFUND",
    amount: 200.0,
    balanceAfter: 3000.0,
    commercialActionId: "00000000-0000-4000-a000-000000000003",
    createdAt: new Date("2026-10-21T12:00:00Z"),
    createdById: MARIA,
  },
];

export async function seedWalletMovements(prisma: PrismaClient): Promise<void> {
  const walletIds = [...new Set(movements.map((movement) => movement.walletId))];
  const walletsWithHistory = new Set(
    (
      await prisma.walletMovement.findMany({
        where: {
          walletId: { in: walletIds },
          id: { notIn: movements.map((movement) => movement.id) },
        },
        select: { walletId: true },
      })
    ).map((movement) => movement.walletId),
  );
  const data = movements.filter((movement) => !walletsWithHistory.has(movement.walletId));
  const { count } = await prisma.walletMovement.createMany({ data, skipDuplicates: true });

  console.log(
    `[seed] Movimentações de carteira: ${count} criada(s), ${data.length - count} já existia(m), ${movements.length - data.length} ignorada(s) em carteiras que já tinham extrato.`,
  );
}
