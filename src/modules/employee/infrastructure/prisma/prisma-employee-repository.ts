import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { CommercialUsage } from "../../../../shared/domain/commercial-usage";
import { countCommercialUsage } from "../../../../shared/infrastructure/database/count-commercial-usage";
import { Employee } from "../../domain/entities/employee";
import {
  EmployeeListItem,
  EmployeeRepository,
  FindEmployeesParams,
  FindEmployeesResult,
} from "../../domain/repositories/employee-repository";
import { PrismaEmployeeMapper } from "./prisma-employee-mapper";

@injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async create(employee: Employee): Promise<Employee> {
    const data = employee.toObject();
    const createdEmployee = await this.prisma.employee.create({ data });

    return PrismaEmployeeMapper.toDomain(createdEmployee);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return employee ? PrismaEmployeeMapper.toDomain(employee) : null;
  }

  async findByPersonId(personId: string, companyId: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        personId,
        companyId,
        deletedAt: null,
      },
    });

    return employee ? PrismaEmployeeMapper.toDomain(employee) : null;
  }

  async findByUserCompanyId(
    userCompanyId: string,
    companyId: string,
  ): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        userCompanyId,
        companyId,
        deletedAt: null,
      },
    });

    return employee ? PrismaEmployeeMapper.toDomain(employee) : null;
  }

  async findManyByIds(ids: string[], companyId: string): Promise<Employee[]> {
    const employees = await this.prisma.employee.findMany({
      where: {
        id: { in: ids },
        companyId,
        deletedAt: null,
      },
    });

    return employees.map(PrismaEmployeeMapper.toDomain);
  }

  async findListItemById(id: string, companyId: string): Promise<EmployeeListItem | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { person: { select: { id: true, name: true, nationalId: true } } },
    });

    return employee
      ? { employee: PrismaEmployeeMapper.toDomain(employee), person: employee.person }
      : null;
  }

  async findMany(params: FindEmployeesParams): Promise<FindEmployeesResult> {
    const now = new Date();
    const where: Prisma.EmployeeWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      person: params.includeDeleted ? undefined : { deletedAt: null },
      OR: params.search
        ? [
            { person: { name: { contains: params.search, mode: "insensitive" } } },
            { person: { nationalId: { contains: params.search, mode: "insensitive" } } },
          ]
        : undefined,
      AND:
        params.active === undefined
          ? undefined
          : [
              params.active
                ? { OR: [{ terminatedAt: null }, { terminatedAt: { gt: now } }] }
                : { terminatedAt: { lte: now } },
            ],
    };

    const [employees, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: { person: { select: { id: true, name: true, nationalId: true } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      employees: employees.map((employee) => ({
        employee: PrismaEmployeeMapper.toDomain(employee),
        person: employee.person,
      })),
      total,
    };
  }

  countCommercialUsage(id: string, companyId: string): Promise<CommercialUsage> {
    return countCommercialUsage(this.prisma, companyId, { employee: { id } });
  }

  async update(employee: Employee): Promise<Employee> {
    const data = employee.toObject();
    const updatedEmployee = await this.prisma.employee.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        personId: data.personId,
        userCompanyId: data.userCompanyId,
        hiredAt: data.hiredAt,
        terminatedAt: data.terminatedAt,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaEmployeeMapper.toDomain(updatedEmployee);
  }

  async delete(employee: Employee): Promise<void> {
    const data = employee.toObject();

    await this.prisma.employee.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        userCompanyId: data.userCompanyId,
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }
}
