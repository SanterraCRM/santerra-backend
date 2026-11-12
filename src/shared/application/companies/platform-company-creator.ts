export const PLATFORM_COMPANY_CREATOR = "PlatformCompanyCreator";

export interface CreatePlatformCompanyInput {
  ownerEmail: string;
  companyName: string;
  companyDescription?: string | null;
  createdById: string;
}

export interface PlatformCompanyCreator {
  create(input: CreatePlatformCompanyInput): Promise<string>;
}
