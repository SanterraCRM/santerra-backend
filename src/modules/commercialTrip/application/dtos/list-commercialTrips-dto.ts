import { CommercialTripStatus } from "../../enumCommercialTrip/EnumCommercialTrip";

export interface ListCommercialTripsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: CommercialTripStatus;
  producerId?: string;
  responsibleId?: string;
  expectedFrom?: Date;
  expectedTo?: Date;
  tripFrom?: Date;
  tripTo?: Date;
  includeDeleted?: boolean;
}
