export interface CreateCommercialActionDto {
  description?: string | null;
  eventId: string;
  price?: number | null;
  initialDate?: Date | null;
  finalDate?: Date | null;
  walletId: string;
  responsibleId: string;
  invoiceNumber?: string | null;
  producerGuestIds?: string[];
  resellerGuestIds?: string[];
  participantIds?: string[];
  fileIds?: string[];
}
