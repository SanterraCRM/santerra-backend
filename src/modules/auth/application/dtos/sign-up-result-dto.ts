import { CompanyProps } from "../../../company";
import { PublicUserProps } from "../../../user";

export interface SignUpResultDto {
  token: string;
  user: PublicUserProps;
  company: CompanyProps;
}
