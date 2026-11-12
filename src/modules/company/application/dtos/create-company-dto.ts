export interface CreateCompanyDto {
  name: string;
  description?: string | null;
  ownerEmail: string;
}
