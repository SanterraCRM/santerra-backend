import { Prisma, Person as PrismaPerson } from "@prisma/client";

import { Person } from "../../domain/entities/person";
import { PersonDetails } from "../../domain/repositories/person-repository";

export const personDetailsInclude = {
  employees: {
    where: { deletedAt: null },
    take: 1,
    select: {
      id: true,
      hiredAt: true,
      terminatedAt: true,
      userCompany: {
        select: { id: true, deletedAt: true, user: { select: { name: true, email: true } } },
      },
    },
  },
  producers: {
    where: { deletedAt: null },
    take: 1,
    select: {
      id: true,
      address: true,
      mainCrop: true,
      totalArea: true,
      potential: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PersonInclude;

type PrismaPersonDetails = Prisma.PersonGetPayload<{ include: typeof personDetailsInclude }>;

export class PrismaPersonMapper {
  static toDomain(raw: PrismaPerson): Person {
    return Person.reconstitute({
      id: raw.id,
      name: raw.name,
      nationalId: raw.nationalId,
      phoneNumber: raw.phoneNumber,
      email: raw.email,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails(raw: PrismaPersonDetails): PersonDetails {
    const [employee] = raw.employees;
    const [producer] = raw.producers;
    const member = employee?.userCompany;

    return {
      person: PrismaPersonMapper.toDomain(raw),
      employee: employee
        ? {
            id: employee.id,
            hiredAt: employee.hiredAt,
            terminatedAt: employee.terminatedAt,
            member:
              member && !member.deletedAt
                ? { id: member.id, name: member.user.name, email: member.user.email }
                : null,
          }
        : null,
      producer: producer
        ? {
            id: producer.id,
            potential: producer.potential,
            address: producer.address,
            mainCrop: producer.mainCrop,
            totalArea: producer.totalArea?.toNumber() ?? null,
          }
        : null,
    };
  }
}
