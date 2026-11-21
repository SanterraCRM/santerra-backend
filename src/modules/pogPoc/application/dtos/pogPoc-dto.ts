import { PogPoc } from "../../domain/entities/pogPoc";
import { PogPocFilterOptions } from "../../domain/gateways/pogPoc-gateway";

export interface PogPocResellerDto {
  id: number;
  name: string;
}

export type PogPocDto = PogPoc & {
  reseller: PogPocResellerDto | null;
};

export type PogPocFilterOptionsDto = PogPocFilterOptions;

export function toPogPocDto(
  pogPoc: PogPoc,
  resellers: Map<string, PogPocResellerDto>,
): PogPocDto {
  return { ...pogPoc, reseller: (pogPoc.cnpj && resellers.get(pogPoc.cnpj)) || null };
}
