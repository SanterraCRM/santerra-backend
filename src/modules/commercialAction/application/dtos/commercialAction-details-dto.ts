import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { CommercialActionProps } from "../../domain/entities/commercialAction";
import {
  CommercialActionDetails,
  CommercialActionFile,
  CommercialActionRelation,
} from "../../domain/repositories/commercialAction-repository";

export interface CommercialActionDetailsDto extends CommercialActionProps {
  event: CommercialActionRelation;
  responsible: CommercialActionRelation;
  wallet: CommercialActionRelation;
  producerGuests: CommercialActionRelation[];
  resellerGuests: CommercialActionRelation[];
  participants: CommercialActionRelation[];
  files: CommercialActionFile[] | null;
}

export function toCommercialActionDetailsDto(
  { commercialAction, files, ...relations }: CommercialActionDetails,
  context: TenantContext,
): CommercialActionDetailsDto {
  return {
    ...commercialAction.toObject(),
    ...relations,
    files: context.permissions.includes(PERMISSIONS.FILES_READ) ? files : null,
  };
}
