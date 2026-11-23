import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Company } from "../../domain/entities/company";
import {
  CompanyDetails,
  CompanyRepository,
  FindCompaniesParams,
  FindCompaniesResult,
} from "../../domain/repositories/company-repository";
import { companyDetailsInclude, PrismaCompanyMapper } from "./prisma-company-mapper";

@injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(company: Company): Promise<Company> {
    const data = company.toObject();
    const createdCompany = await this.prisma.company.create({ data });

    return PrismaCompanyMapper.toDomain(createdCompany);
  }

  async findById(id: string, includeDeleted = false): Promise<Company | null> {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return company ? PrismaCompanyMapper.toDomain(company) : null;
  }

  async findDetailsById(id: string): Promise<CompanyDetails | null> {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: companyDetailsInclude,
    });

    return company ? PrismaCompanyMapper.toDetails(company) : null;
  }

  async findMany(params: FindCompaniesParams): Promise<FindCompaniesResult> {
    const where: Prisma.CompanyWhereInput = {
      deletedAt: params.includeDeleted ? undefined : null,
      active: params.active,
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        include: companyDetailsInclude,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      companies: companies.map(PrismaCompanyMapper.toDetails),
      total,
    };
  }

  async update(company: Company): Promise<Company> {
    const data = company.toObject();
    const updatedCompany = await this.prisma.company.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        active: data.active,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaCompanyMapper.toDomain(updatedCompany);
  }

  async delete(company: Company): Promise<void> {
    const data = company.toObject();

    await this.prisma.company.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }
}
