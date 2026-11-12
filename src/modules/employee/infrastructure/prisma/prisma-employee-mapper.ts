import { Employee as PrismaEmployee } from "@prisma/client";

import { Employee } from "../../domain/entities/employee";

export class PrismaEmployeeMapper {
  static toDomain(raw: PrismaEmployee): Employee {
    return Employee.reconstitute({
      id: raw.id,
      personId: raw.personId,
      userCompanyId: raw.userCompanyId,
      hiredAt: raw.hiredAt,
      terminatedAt: raw.terminatedAt,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
