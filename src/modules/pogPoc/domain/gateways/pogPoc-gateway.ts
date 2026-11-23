import { PogPoc } from "../entities/pogPoc";

export const POG_POC_GATEWAY = "PogPocGateway";

export interface FindPogPocsParams {
  page: number;
  limit: number;
  search?: string;
  cnpj?: string;
  regiao?: string;
}

export interface FindPogPocsResult {
  pogPocs: PogPoc[];
  total: number;
}

export interface PogPocFilterOptions {
  regioes: string[];
}

export interface PogPocGateway {
  findByProductCode(productCode: number): Promise<PogPoc[]>;

  findMany(params: FindPogPocsParams): Promise<FindPogPocsResult>;

  findFilterOptions(): Promise<PogPocFilterOptions>;
}
