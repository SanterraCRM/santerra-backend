import { injectable } from "tsyringe";

import { ServiceUnavailableError } from "../../../../shared/errors/app-error";
import { PogPoc } from "../../domain/entities/pogPoc";
import {
  FindPogPocsParams,
  FindPogPocsResult,
  PogPocFilterOptions,
  PogPocGateway,
} from "../../domain/gateways/pogPoc-gateway";
import { PogPocMapper, RawPogPoc } from "./pogPoc-mapper";

const POG_POC_API_URL = process.env.POG_POC_API_URL ?? "";

const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 5 * 60 * 1000;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function byProduct(first: PogPoc, second: PogPoc): number {
  return (first.produto ?? "").localeCompare(second.produto ?? "", "pt-BR");
}

@injectable()
export class HttpPogPocGateway implements PogPocGateway {
  private cache: { data: PogPoc[]; expiresAt: number } | null = null;

  async findByProductCode(productCode: number): Promise<PogPoc[]> {
    const pogPocs = await this.findAll();

    return pogPocs.filter((pogPoc) => pogPoc.codigo_produto === productCode);
  }

  async findMany(params: FindPogPocsParams): Promise<FindPogPocsResult> {
    const pogPocs = (await this.findAll()).filter((pogPoc) => this.matches(pogPoc, params));
    const start = (params.page - 1) * params.limit;

    return {
      pogPocs: pogPocs.slice(start, start + params.limit),
      total: pogPocs.length,
    };
  }

  async findFilterOptions(): Promise<PogPocFilterOptions> {
    const pogPocs = await this.findAll();
    const regioes = new Set(
      pogPocs.map(({ regiao }) => regiao).filter((regiao): regiao is string => regiao !== null),
    );

    return {
      regioes: [...regioes].sort((first, second) => first.localeCompare(second, "pt-BR")),
    };
  }

  private matches(pogPoc: PogPoc, params: FindPogPocsParams): boolean {
    if (params.search) {
      const search = normalize(params.search);
      const matchesName = normalize(pogPoc.produto ?? "").includes(search);
      const matchesCode = String(pogPoc.codigo_produto ?? "") === search;
      const matchesCnpj = pogPoc.cnpj?.includes(search) ?? false;

      if (!matchesName && !matchesCode && !matchesCnpj) {
        return false;
      }
    }

    if (params.cnpj && !pogPoc.cnpj?.includes(params.cnpj)) {
      return false;
    }

    if (params.regiao && normalize(pogPoc.regiao ?? "") !== normalize(params.regiao)) {
      return false;
    }

    return true;
  }

  private async findAll(): Promise<PogPoc[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }

    const data = (await this.request()).map(PogPocMapper.toDomain).sort(byProduct);

    this.cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };

    return data;
  }

  private async request(): Promise<RawPogPoc[]> {
    let response: Response;

    try {
      response = await fetch(POG_POC_API_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new ServiceUnavailableError("Não foi possível consultar os POG/POC. Tente novamente.");
    }

    if (!response.ok) {
      throw new ServiceUnavailableError("Não foi possível consultar os POG/POC. Tente novamente.");
    }

    const body: unknown = await response.json();

    if (!Array.isArray(body)) {
      throw new ServiceUnavailableError("A API de POG/POC retornou um formato inesperado.");
    }

    return body as RawPogPoc[];
  }
}
