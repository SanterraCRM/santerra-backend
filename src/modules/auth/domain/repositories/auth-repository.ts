import { Company } from "../../../company";
import { Member } from "../../../member";
import { Role } from "../../../role";
import { User } from "../../../user";
import { EmailVerification } from "../entities/email-verification";

export const AUTH_REPOSITORY = "AuthRepository";

export interface UserCompanySummary {
  id: string;
  name: string;
  logo: string | null;
}

export interface CompanyAccess {
  userCompanyId: string;
  company: UserCompanySummary;
  isOwner: boolean;
  rolePermissions: string[];
}

export interface CreateCompanyWithOwnerParams {
  user?: User;
  company: Company;
  ownerRole: Role;
  owner: Member;
  emailVerification?: EmailVerification;
}

export interface AuthRepository {
  findCompanies(userId: string): Promise<UserCompanySummary[]>;
  findAccess(userId: string, companyId: string): Promise<CompanyAccess | null>;
  createCompanyWithOwner(params: CreateCompanyWithOwnerParams): Promise<void>;
}
