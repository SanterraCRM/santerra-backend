import { CommercialTripStatus } from "../../enumCommercialTrip/EnumCommercialTrip";

export interface CreateCommercialTripDto {
  performedActionDescription?: string | null;
  followUpDetails?: string | null;
  pendingIssuesDescription?: string | null;
  status: CommercialTripStatus,
  tripDate?: Date | null;
  expectedDate?: Date | null;
  producerId: string;
  responsibleId: string;
  participantIds?: string[];
  harvestIds?: string[];
  recommendedProductIds?: string[];
  fileIds?: string[];
}
