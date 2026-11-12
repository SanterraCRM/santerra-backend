import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Manufacturer } from "../../domain/entities/manufacturer";
import {
  ManufacturerRepository,
  FindManufacturersParams,
  FindManufacturersResult,
  ManufacturerOptionalField,
} from "../../domain/repositories/manufacturer-repository";
import { PrismaManufacturerMapper } from "./prisma-manufacturer-mapper";

const ACTIVE_PRODUCTS: Prisma.ProductWhereInput = { deletedAt: null };

const MISSING_FIELD_FILTERS: Record<ManufacturerOptionalField, Prisma.ManufacturerWhereInput> = {
  registrationNumber: { OR: [{ registrationNumber: null }, { registrationNumber: "" }] },
  phoneNumber: { OR: [{ phoneNumber: null }, { phoneNumber: "" }] },
  email: { OR: [{ email: null }, { email: "" }] },
};

@injectable()
export class PrismaManufacturerRepository implements ManufacturerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(manufacturer: Manufacturer): Promise<Manufacturer> {
    const data = manufacturer.toObject();
    const createdManufacturer = await this.prisma.manufacturer.create({ data });

    return PrismaManufacturerMapper.toDomain(createdManufacturer);
  }

  async findById(id: string, includeDeleted = false): Promise<Manufacturer | null> {
    const manufacturer = await this.prisma.manufacturer.findFirst({
      where: {
        id,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return manufacturer ? PrismaManufacturerMapper.toDomain(manufacturer) : null;
  }

  async findByName(name: string): Promise<Manufacturer | null> {
    const manufacturer = await this.prisma.manufacturer.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    return manufacturer ? PrismaManufacturerMapper.toDomain(manufacturer) : null;
  }

  async findMany(params: FindManufacturersParams): Promise<FindManufacturersResult> {
    const where: Prisma.ManufacturerWhereInput = {
      deletedAt: params.includeDeleted ? undefined : null,
      createdAt: { gte: params.createdFrom, lte: params.createdTo },
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { registrationNumber: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
      AND: params.missing?.map((field) => MISSING_FIELD_FILTERS[field]),
    };

    const [manufacturers, total] = await this.prisma.$transaction([
      this.prisma.manufacturer.findMany({
        where,
        include: { _count: { select: { products: { where: ACTIVE_PRODUCTS } } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.manufacturer.count({ where }),
    ]);

    return {
      manufacturers: manufacturers.map((manufacturer) => ({
        manufacturer: PrismaManufacturerMapper.toDomain(manufacturer),
        productsCount: manufacturer._count.products,
      })),
      total,
    };
  }

  async countProducts(id: string): Promise<number> {
    return this.prisma.product.count({ where: { ...ACTIVE_PRODUCTS, manufacturerId: id } });
  }

  async update(manufacturer: Manufacturer): Promise<Manufacturer> {
    const data = manufacturer.toObject();
    const updatedManufacturer = await this.prisma.manufacturer.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        registrationNumber: data.registrationNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaManufacturerMapper.toDomain(updatedManufacturer);
  }

  async delete(manufacturer: Manufacturer): Promise<void> {
    const data = manufacturer.toObject();

    await this.prisma.manufacturer.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }
}
