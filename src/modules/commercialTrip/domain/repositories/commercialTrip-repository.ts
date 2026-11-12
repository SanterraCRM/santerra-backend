import { CommercialTrip } from "../entities/commercialTrip";
import { CommercialTripStatus } from "../../enumCommercialTrip/EnumCommercialTrip";

export const COMMERCIAL_TRIP_REPOSITORY = "CommercialTripRepository";

export interface FindCommercialTripsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  status?: CommercialTripStatus;
  producerId?: string;
  responsibleId?: string;
  expectedFrom?: Date;
  expectedTo?: Date;
  tripFrom?: Date;
  tripTo?: Date;
  includeDeleted: boolean;
}

export interface CommercialTripRelation {
  id: string;
  name: string;
}

export interface CommercialTripFile {
  id: string;
  originalName: string | null;
  mimeType: string;
  size: number;
}

export interface CommercialTripDetails {
  commercialTrip: CommercialTrip;
  producer: CommercialTripRelation;
  responsible: CommercialTripRelation;
  participants: CommercialTripRelation[];
  harvests: CommercialTripRelation[];
  recommendedProducts: CommercialTripRelation[];
  files: CommercialTripFile[];
}

export interface FindCommercialTripsResult {
  commercialTrips: CommercialTripDetails[];
  total: number;
}

export interface CommercialTripRepository {
  create(commercialTrip: CommercialTrip): Promise<CommercialTripDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<CommercialTrip | null>;
  findDetailsById(id: string, companyId: string): Promise<CommercialTripDetails | null>;
  findMany(params: FindCommercialTripsParams): Promise<FindCommercialTripsResult>;
  update(commercialTrip: CommercialTrip): Promise<CommercialTripDetails>;
  delete(commercialTrip: CommercialTrip): Promise<void>;
}
