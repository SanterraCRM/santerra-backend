import { ResellerView } from "../../domain/entities/resellersView";

export interface ResellerViewDto {
  companyId: number | null;
  id: number | null;
  isActive: number | null;
  name: string | null;
  fantasyName: string | null;
  legalType: string | null;
  document: string | null;
  registrationType: string | null;
  registration: string | null;
  activity: string | null;
  creditStatus: string | null;
  clientGroupCode: string | null;
  clientGroup: string | null;
  sellerCode: string | null;
  areaCode: string | null;
  area: string | null;
  createdAt: Date | null;
  lastBuyDate: Date | null;
  lastBuyValue: number | null;
  creditLimitValue: number | null;
  orderType: string | null;
  route: string | null;
  email: string | null;
  affiliation: string | null;
  cnae: string | null;
  foundationDate: Date | null;
  contactName: string | null;
  contactPosition: string | null;
  contactEmail: string | null;
  contactDDD: string | null;
  contactPhone: string | null;
  clientPhoneDDD: string | null;
  clientPhone: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  cep: string | null;
  state: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
}

export function toResellerViewDto(
  reseller: ResellerView,
): ResellerViewDto {
  return {
    ...reseller,
  };
}