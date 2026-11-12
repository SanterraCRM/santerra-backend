import { CompanyProps } from "../../domain/entities/company";
import { CompanyDetails, CompanyOwner } from "../../domain/repositories/company-repository";

export interface CompanyDetailsDto extends CompanyProps {
  owner: CompanyOwner | null;
  membersCount: number;
}

export function toCompanyDetailsDto({
  company,
  owner,
  membersCount,
}: CompanyDetails): CompanyDetailsDto {
  return { ...company.toObject(), owner, membersCount };
}
