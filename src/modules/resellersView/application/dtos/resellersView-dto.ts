import { ResellerView } from "../../domain/entities/resellersView";

export interface ResellerViewDto {
  companyId: number;
  id: number;
  isActive: number;
  name: string;
  fantasyName: string;
  legalType: string;
  document: string;
  registrationType: string;
  registration: string;
  activity: string;
  creditStatus: string;
  clientGroupCode: string;
  clientGroup: string;
  sellerCode: string;
  areaCode: string;
  area: string;
  createdAt: Date;
  lastBuyDate: Date;
  lastBuyValue: number;
  creditLimitValue: number;
  orderType: string;
  route: string;
  email: string;
  affiliation: string;
  cnae: string;
  foundationDate: Date;
  contactName: string;
  contactPosition: string;
  contactEmail: string;
  contactDDD: string;
  contactPhone: string;
  clientPhoneDDD: string;
  clientPhone: string;
  address: string;
  neighborhood: string;
  city: string;
  cep: string;
  state: string;
  street: string;
  number: string;
  complement: string;
}

export function toResellerViewDto(
  reseller: ResellerView,
): ResellerViewDto {
  return {
    ...reseller,
  };
}