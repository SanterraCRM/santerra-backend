import { CommercialAction, WalletCharge } from "../entities/commercialAction";

export const COMMERCIAL_ACTION_REPOSITORY = "CommercialActionRepository";

export interface FindCommercialActionsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  eventId?: string;
  responsibleId?: string;
  walletId?: string;
  initialFrom?: Date;
  initialTo?: Date;
  includeDeleted: boolean;
}

export interface CommercialActionRelation {
  id: string;
  name: string;
}

export interface CommercialActionFile {
  id: string;
  originalName: string | null;
  mimeType: string;
  size: number;
}

export interface CommercialActionDetails {
  commercialAction: CommercialAction;
  event: CommercialActionRelation;
  responsible: CommercialActionRelation;
  wallet: CommercialActionRelation;
  producerGuests: CommercialActionRelation[];
  resellerGuests: CommercialActionRelation[];
  participants: CommercialActionRelation[];
  files: CommercialActionFile[];
}

export interface FindCommercialActionsResult {
  commercialActions: CommercialActionDetails[];
  total: number;
}

export interface CommercialActionRepository {
  create(commercialAction: CommercialAction): Promise<CommercialActionDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<CommercialAction | null>;
  findDetailsById(id: string, companyId: string): Promise<CommercialActionDetails | null>;
  findMany(params: FindCommercialActionsParams): Promise<FindCommercialActionsResult>;
  update(
    commercialAction: CommercialAction,
    previousCharge: WalletCharge,
  ): Promise<CommercialActionDetails>;
  delete(commercialAction: CommercialAction): Promise<void>;
}
