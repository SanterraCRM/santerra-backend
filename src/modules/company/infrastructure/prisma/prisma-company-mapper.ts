import { Prisma, Company as PrismaCompany } from "@prisma/client";

import { Company } from "../../domain/entities/company";
import { CompanyDetails } from "../../domain/repositories/company-repository";

const ACTIVE_MEMBERS = { deletedAt: null };

export const companyDetailsInclude = {
  userCompanies: {
    where: { ...ACTIVE_MEMBERS, isOwner: true },
    take: 1,
    select: { user: { select: { id: true, name: true, email: true } } },
  },
  _count: { select: { userCompanies: { where: ACTIVE_MEMBERS } } },
} satisfies Prisma.CompanyInclude;

type PrismaCompanyDetails = Prisma.CompanyGetPayload<{ include: typeof companyDetailsInclude }>;

export class PrismaCompanyMapper {
  static toDomain(raw: PrismaCompany): Company {
    return Company.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      logo: raw.logo,
      active: raw.active,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ userCompanies, _count, ...raw }: PrismaCompanyDetails): CompanyDetails {
    return {
      company: PrismaCompanyMapper.toDomain(raw),
      owner: userCompanies[0]?.user ?? null,
      membersCount: _count.userCompanies,
    };
  }
}
