import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { ProductView } from "../../domain/entities/productView";
import {
  FindProductsViewParams,
  FindProductsViewResult,
  ProductViewFilterOptions,
  ProductViewRepository,
} from "../../domain/repositories/productView-repository";
import { PrismaProductViewMapper, trimViewText } from "./prisma-productView-mapper";

const ACTIVE = 1;

type TextField = "department" | "section" | "category" | "line";

type FilterField = TextField | "manufacturerId";

const TEXT_FIELDS: TextField[] = ["department", "section", "category", "line"];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function compactSorted(values: (string | null)[]): string[] {
  const unique = new Set(
    values.map(trimViewText).filter((value): value is string => value !== null),
  );

  return [...unique].sort((first, second) => first.localeCompare(second, "pt-BR"));
}

@injectable()
export class PrismaProductViewRepository implements ProductViewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<ProductView | null> {
    const productView = await this.prisma.productsView.findFirst({
      where: { id },
    });

    return productView ? PrismaProductViewMapper.toDomain(productView) : null;
  }

  async findManyByIds(ids: number[]): Promise<ProductView[]> {
    if (ids.length === 0) {
      return [];
    }

    const productsView = await this.prisma.productsView.findMany({
      where: { id: { in: ids } },
    });

    return productsView.map(PrismaProductViewMapper.toDomain);
  }

  async findMany(params: FindProductsViewParams): Promise<FindProductsViewResult> {
    const where = await this.buildWhere(params);

    const [productView, total] = await Promise.all([
      this.prisma.productsView.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { product: "asc" },
      }),
      this.prisma.productsView.count({ where }),
    ]);

    return {
      productsView: productView.map(PrismaProductViewMapper.toDomain),
      total,
    };
  }

  async findCropsByProductIds(productIds: number[]): Promise<Map<number, string[]>> {
    const cropsByProduct = new Map<number, string[]>();

    if (productIds.length === 0) {
      return cropsByProduct;
    }

    const rows = await this.prisma.cropsView.findMany({
      where: { productId: { in: productIds }, crop: { not: null } },
      select: { productId: true, crop: true },
      orderBy: { crop: "asc" },
    });

    rows.forEach(({ productId, crop }) => {
      if (productId === null || !crop) {
        return;
      }

      cropsByProduct.set(productId, [...(cropsByProduct.get(productId) ?? []), crop]);
    });

    return cropsByProduct;
  }

  async findFilterOptions(): Promise<ProductViewFilterOptions> {
    const [manufacturers, [departments, sections, categories, lines], crops] =
      await Promise.all([
        this.prisma.productsView.findMany({
          where: { manufacturerId: { not: null }, manufacturer: { not: null } },
          select: { manufacturerId: true, manufacturer: true },
          distinct: ["manufacturerId"],
        }),
        Promise.all(TEXT_FIELDS.map((field) => this.distinctValues(field))),
        this.prisma.cropsView.findMany({
          where: { crop: { not: null } },
          select: { crop: true },
          distinct: ["crop"],
        }),
      ]);

    const manufacturersById = new Map<string, string>();

    manufacturers.forEach((row) => {
      const id = trimViewText(row.manufacturerId);
      const name = trimViewText(row.manufacturer);

      if (id && name) {
        manufacturersById.set(id, name);
      }
    });

    return {
      manufacturers: [...manufacturersById]
        .map(([id, name]) => ({ id, name }))
        .sort((first, second) => first.name.localeCompare(second.name, "pt-BR")),
      departments,
      sections,
      categories,
      lines,
      crops: compactSorted(crops.map(({ crop }) => crop)),
    };
  }

  private async distinctValues(field: TextField): Promise<string[]> {
    const rows = await this.prisma.productsView.findMany({
      where: { [field]: { not: null } },
      select: { [field]: true },
      distinct: [field],
    });

    return compactSorted(
      rows.map((row) => (row as Partial<Record<TextField, string | null>>)[field] ?? null),
    );
  }

  // A view guarda alguns textos com espaços à direita, e o Prisma não compara com trim.
  // Busca os valores brutos que começam pelo filtro e mantém os que, sem espaços, são iguais a ele.
  private async findRawValues(field: FilterField, value: string): Promise<string[]> {
    const rows = await this.prisma.productsView.findMany({
      where: { [field]: { startsWith: value.trim(), mode: "insensitive" } },
      select: { [field]: true },
      distinct: [field],
    });

    return rows
      .map((row) => (row as Partial<Record<FilterField, string | null>>)[field] ?? null)
      .filter((raw): raw is string => raw !== null && normalize(raw) === normalize(value));
  }

  private async buildWhere(
    params: FindProductsViewParams,
  ): Promise<Prisma.productsViewWhereInput> {
    const conditions: Prisma.productsViewWhereInput[] = [];

    if (params.search) {
      conditions.push({ product: { contains: params.search, mode: "insensitive" } });
    }

    if (params.isActive !== undefined) {
      conditions.push(
        params.isActive
          ? { isActive: ACTIVE }
          : { OR: [{ isActive: { not: ACTIVE } }, { isActive: null }] },
      );
    }

    for (const field of ["manufacturerId", ...TEXT_FIELDS] as FilterField[]) {
      const value = params[field];

      if (value) {
        conditions.push({ [field]: { in: await this.findRawValues(field, value) } });
      }
    }

    if (params.crop) {
      const rows = await this.prisma.cropsView.findMany({
        where: { crop: { equals: params.crop, mode: "insensitive" }, productId: { not: null } },
        select: { productId: true },
      });

      conditions.push({
        id: { in: rows.flatMap(({ productId }) => (productId === null ? [] : [productId])) },
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }
}
