import { UserCompanySummary } from "../../domain/repositories/auth-repository";

export interface SelectCompanyResultDto {
  token: string;
  company: UserCompanySummary;
  permissions: string[];
}
