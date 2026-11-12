export interface CreateProducerDto {
  personId: string;
  potentialId: string;
  address?: string | null;
  mainCrop?: string | null;
  totalArea?: number | null;
}
