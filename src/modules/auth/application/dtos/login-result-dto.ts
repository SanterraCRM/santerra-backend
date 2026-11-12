import { PublicUserProps } from "../../../user";
import { UserCompanySummary } from "../../domain/repositories/auth-repository";

export interface LoginResultDto {
  token: string;
  user: PublicUserProps;
  companies: UserCompanySummary[];
}
