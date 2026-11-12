import { PublicUserProps } from "../../../user";
import { UserCompanySummary } from "../../domain/repositories/auth-repository";

export interface SessionDto {
  user: PublicUserProps;
  companies: UserCompanySummary[];
  currentCompanyId: string | null;
  permissions: string[];
}
