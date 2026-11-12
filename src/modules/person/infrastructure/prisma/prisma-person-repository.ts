import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { CommercialUsage } from "../../../../shared/domain/commercial-usage";
import { countCommercialUsage } from "../../../../shared/infrastructure/database/count-commercial-usage";
import { Person } from "../../domain/entities/person";
import {
  PersonRepository,
  FindPersonsParams,
  FindPersonsResult,
  PersonDetails,
  PersonLinks,
  PersonOptionalField,
} from "../../domain/repositories/person-repository";
import { PrismaPersonMapper, personDetailsInclude } from "./prisma-person-mapper";

// O schema de criação aceita e-mail "", então vazio também conta como não informado.
const MISSING_FIELD_FILTERS: Record<PersonOptionalField, Prisma.PersonWhereInput> = {
  nationalId: { OR: [{ nationalId: null }, { nationalId: "" }] },
  phoneNumber: { OR: [{ phoneNumber: null }, { phoneNumber: "" }] },
  email: { OR: [{ email: null }, { email: "" }] },
};

@injectable()
export class PrismaPersonRepository implements PersonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(person: Person, links: PersonLinks = {}): Promise<PersonDetails> {
    const createdPerson = await this.prisma.$transaction(async (transaction) => {
      await transaction.person.create({ data: person.toObject() });

      if (links.employee) {
        await transaction.employee.create({ data: links.employee.toObject() });
      }

      if (links.producer) {
        await transaction.producer.create({ data: links.producer.toObject() });
      }

      return transaction.person.findUniqueOrThrow({
        where: { id: person.id },
        include: personDetailsInclude,
      });
    });

    return PrismaPersonMapper.toDetails(createdPerson);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Person | null> {
    const person = await this.prisma.person.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return person ? PrismaPersonMapper.toDomain(person) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<PersonDetails | null> {
    const person = await this.prisma.person.findFirst({
      where: { id, companyId, deletedAt: null },
      include: personDetailsInclude,
    });

    return person ? PrismaPersonMapper.toDetails(person) : null;
  }

  async findByNationalId(
    nationalId: string,
    companyId: string,
  ): Promise<Person | null> {
    const person = await this.prisma.person.findFirst({
      where: {
        nationalId,
        companyId,
        deletedAt: null,
      },
    });

    return person ? PrismaPersonMapper.toDomain(person) : null;
  }

  async findMany(params: FindPersonsParams): Promise<FindPersonsResult> {
    const where: Prisma.PersonWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      createdAt: { gte: params.createdFrom, lte: params.createdTo },
      employees:
        params.type === "employee" ? { some: { deletedAt: null } } : undefined,
      producers:
        params.type === "producer" ? { some: { deletedAt: null } } : undefined,
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { nationalId: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
      AND: params.missing?.map((field) => MISSING_FIELD_FILTERS[field]),
    };

    const [persons, total] = await this.prisma.$transaction([
      this.prisma.person.findMany({
        where,
        include: personDetailsInclude,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      persons: persons.map(PrismaPersonMapper.toDetails),
      total,
    };
  }

  countCommercialUsage(id: string, companyId: string): Promise<CommercialUsage> {
    const link = { personId: id, deletedAt: null };

    return countCommercialUsage(this.prisma, companyId, { employee: link, producer: link });
  }

  async update(person: Person): Promise<PersonDetails> {
    const data = person.toObject();
    const updatedPerson = await this.prisma.person.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        name: data.name,
        nationalId: data.nationalId,
        phoneNumber: data.phoneNumber,
        email: data.email,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
      include: personDetailsInclude,
    });

    return PrismaPersonMapper.toDetails(updatedPerson);
  }

  async delete(person: Person): Promise<void> {
    const data = person.toObject();
    const deletion = { deletedAt: data.deletedAt, deletedById: data.deletedById };
    const links = { personId: data.id, companyId: data.companyId, deletedAt: null };

    await this.prisma.$transaction([
      this.prisma.person.update({
        where: {
          id: data.id,
          companyId: data.companyId,
          deletedAt: null,
        },
        data: deletion,
      }),
      this.prisma.employee.updateMany({
        where: links,
        data: { ...deletion, userCompanyId: null },
      }),
      this.prisma.producer.updateMany({ where: links, data: deletion }),
    ]);
  }
}
