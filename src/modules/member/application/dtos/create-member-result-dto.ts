import { MemberDetailsDto } from "./member-details-dto";

export interface CreateMemberResultDto {
  member: MemberDetailsDto;
  accountCreated: boolean;
}
