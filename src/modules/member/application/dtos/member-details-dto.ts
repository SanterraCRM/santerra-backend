import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { MemberProps } from "../../domain/entities/member";
import {
  MemberDetails,
  MemberEmployee,
} from "../../domain/repositories/member-repository";

export interface MemberDetailsDto extends MemberProps {
  employee: MemberEmployee | null;
}

export function toMemberDetailsDto(
  { member, employee }: MemberDetails,
  context: TenantContext,
): MemberDetailsDto {
  const canReadEmployees = context.permissions.includes(PERMISSIONS.EMPLOYEES_READ);

  return { ...member.toObject(), employee: canReadEmployees ? employee : null };
}
