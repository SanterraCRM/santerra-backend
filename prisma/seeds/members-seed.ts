import { PrismaClient } from "@prisma/client";

interface MemberSeed {
  id: string;
  userId: string;
  companyId: string;
  isOwner?: boolean;
  roleIds: string[];
}

const members: MemberSeed[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    userId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
    isOwner: true,
    roleIds: ["00000000-0000-4000-a000-000000000001"],
  },
  {
id: "00000000-0000-4000-a000-000000000002",
    userId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000002",
    roleIds: ["00000000-0000-4000-a000-000000000002"],
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    userId: "00000000-0000-4000-a000-000000000004",
    companyId: "00000000-0000-4000-a000-000000000002",
    isOwner: true,
    roleIds: ["00000000-0000-4000-a000-000000000004"],
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    userId: "00000000-0000-4000-a000-000000000002",
    companyId: "00000000-0000-4000-a000-000000000001",
    roleIds: [],
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    userId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000003",
    roleIds: [],
  },
];

export async function seedMembers(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.userCompany.createMany({
    data: members.map(({ roleIds: _roleIds, ...member }) => member),
    skipDuplicates: true,
  });

  await prisma.userRole.createMany({
    data: members.flatMap((member) =>
      member.roleIds.map((roleId) => ({
        roleId,
        userCompanyId: member.id,
        companyId: member.companyId,
      })),
    ),
    skipDuplicates: true,
  });

  console.log(
    `[seed] Membros: ${count} criado(s), ${members.length - count} já existia(m).`,
  );
}
