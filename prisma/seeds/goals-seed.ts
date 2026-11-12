import { Prisma, PrismaClient } from "@prisma/client";

const goals: Prisma.GoalCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    employeeId: "00000000-0000-4000-a000-000000000001",
    metric: "COMPLETED_TRIPS",
    targetValue: 10,
    startDate: new Date("2026-11-01T00:00:00-03:00"),
    endDate: new Date("2026-11-30T00:00:00-03:00"),
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    employeeId: "00000000-0000-4000-a000-000000000002",
    metric: "COMMERCIAL_ACTIONS",
    targetValue: 4,
    startDate: new Date("2026-10-01T00:00:00-03:00"),
    endDate: new Date("2026-12-31T00:00:00-03:00"),
    description: "Quarto trimestre",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    employeeId: "00000000-0000-4000-a000-000000000001",
    metric: "SALES",
    targetValue: 250000,
    achievedValue: 85000,
    startDate: new Date("2026-07-01T00:00:00-03:00"),
    endDate: new Date("2027-06-30T00:00:00-03:00"),
    description: "Safra 2026/27",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    employeeId: "00000000-0000-4000-a000-000000000002",
    metric: "VISITED_PRODUCERS",
    targetValue: 5,
    startDate: new Date("2026-10-01T00:00:00-03:00"),
    endDate: new Date("2026-10-31T00:00:00-03:00"),
    companyId: "00000000-0000-4000-a000-000000000001",
  },
];

export async function seedGoals(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.goal.createMany({
    data: goals,
    skipDuplicates: true,
  });

  console.log(`[seed] Metas: ${count} criada(s), ${goals.length - count} já existia(m).`);
}
