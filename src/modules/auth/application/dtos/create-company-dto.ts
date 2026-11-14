export interface CreateCompanyDto {
  name: string;
  description?: string | null;
  logo?: Buffer;
}
