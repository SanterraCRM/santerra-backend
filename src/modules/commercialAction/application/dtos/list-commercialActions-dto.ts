export interface ListCommercialActionsDto {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  responsibleId?: string;
  walletId?: string;
  initialFrom?: Date;
  initialTo?: Date;
  includeDeleted?: boolean;
}
