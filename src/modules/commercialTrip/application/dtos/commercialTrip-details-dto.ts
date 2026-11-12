import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { CommercialTripProps } from "../../domain/entities/commercialTrip";
import {
  CommercialTripDetails,
  CommercialTripFile,
  CommercialTripRelation,
} from "../../domain/repositories/commercialTrip-repository";

export interface CommercialTripDetailsDto extends CommercialTripProps {
  producer: CommercialTripRelation;
  responsible: CommercialTripRelation;
  participants: CommercialTripRelation[];
  harvests: CommercialTripRelation[];
  recommendedProducts: CommercialTripRelation[] | null;
  files: CommercialTripFile[] | null;
}

export function toCommercialTripDetailsDto(
  { commercialTrip, recommendedProducts, files, ...relations }: CommercialTripDetails,
  context: TenantContext,
): CommercialTripDetailsDto {
  const can = (permission: string) => context.permissions.includes(permission);

  return {
    ...commercialTrip.toObject(),
    ...relations,
    recommendedProducts: can(PERMISSIONS.PRODUCTS_READ) ? recommendedProducts : null,
    files: can(PERMISSIONS.FILES_READ) ? files : null,
  };
}
