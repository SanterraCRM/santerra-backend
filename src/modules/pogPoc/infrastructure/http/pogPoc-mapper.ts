import { PogPoc } from "../../domain/entities/pogPoc";

export type RawPogPoc = Partial<Record<keyof PogPoc, unknown>>;

function toText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value).trim() || null;
}

function toCode(value: unknown): number | null {
  const code = Number(toText(value));

  return Number.isInteger(code) && code > 0 ? code : null;
}

export class PogPocMapper {
  static toDomain(raw: RawPogPoc): PogPoc {
    return {
      codigo_produto: toCode(raw.codigo_produto),
      produto: toText(raw.produto),
      cnpj: toText(raw.cnpj),
      regiao: toText(raw.regiao),
      pog: toText(raw.pog),
      poc: toText(raw.poc),
    };
  }
}
