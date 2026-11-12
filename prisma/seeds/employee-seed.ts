import { Prisma, PrismaClient } from "@prisma/client";

const employees: Prisma.EmployeeCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    personId: "00000000-0000-4000-a000-000000000001",
    hiredAt: new Date("2026-01-01"),
    terminatedAt: null,
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    personId: "00000000-0000-4000-a000-000000000002",
    hiredAt: new Date("2026-02-01"),
    terminatedAt: null,
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    personId: "00000000-0000-4000-a000-000000000003",
    hiredAt: new Date("2026-03-01"),
    terminatedAt: new Date("2026-10-01"),
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    personId: "00000000-0000-4000-a000-000000000004",
    hiredAt: new Date("2026-04-10"),
    terminatedAt: new Date("2026-10-10"),
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedEmployees(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.employee.createMany({
    data: employees,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Funcionários: ${count} criado(s), ${employees.length - count} já existia(m).`,
  );
}
