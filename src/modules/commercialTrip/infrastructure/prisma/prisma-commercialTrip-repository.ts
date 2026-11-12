import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import {
  CommercialTrip,
  CommercialTripProps,
} from "../../domain/entities/commercialTrip";
import {
  CommercialTripDetails,
  CommercialTripRepository,
  FindCommercialTripsParams,
  FindCommercialTripsResult,
} from "../../domain/repositories/commercialTrip-repository";
import {
  commercialTripDetailsInclude,
  commercialTripInclude,
  PrismaCommercialTripMapper,
} from "./prisma-commercialTrip-mapper";

@injectable()
export class PrismaCommercialTripRepository implements CommercialTripRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(commercialTrip: CommercialTrip): Promise<CommercialTripDetails> {
    const props = commercialTrip.toObject();
    const {
      participantIds: _participantIds,
      harvestIds: _harvestIds,
      recommendedProductIds: _recommendedProductIds,
      fileIds: _fileIds,
      ...data
    } = props;
    const createdCommercialTrip = await this.prisma.$transaction(async (transaction) => {
      await transaction.commercialTrip.create({ data });
      await this.replaceLinks(transaction, props);

      return transaction.commercialTrip.findUniqueOrThrow({
        where: { id: data.id },
        include: commercialTripDetailsInclude,
      });
    });

    return PrismaCommercialTripMapper.toDetails(createdCommercialTrip);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<CommercialTrip | null> {
    const commercialTrip = await this.prisma.commercialTrip.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: commercialTripInclude,
    });

    return commercialTrip ? PrismaCommercialTripMapper.toDomain(commercialTrip) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<CommercialTripDetails | null> {
    const commercialTrip = await this.prisma.commercialTrip.findFirst({
      where: { id, companyId, deletedAt: null },
      include: commercialTripDetailsInclude,
    });

    return commercialTrip ? PrismaCommercialTripMapper.toDetails(commercialTrip) : null;
  }

  async findMany(params: FindCommercialTripsParams): Promise<FindCommercialTripsResult> {
    const where: Prisma.CommercialTripWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      status: params.status,
      producerId: params.producerId,
      responsibleId: params.responsibleId,
      expectedDate: { gte: params.expectedFrom, lte: params.expectedTo },
      tripDate: { gte: params.tripFrom, lte: params.tripTo },
      OR: params.search
        ? [
            { producer: { person: { name: { contains: params.search, mode: "insensitive" } } } },
            { responsible: { person: { name: { contains: params.search, mode: "insensitive" } } } },
          ]
        : undefined,
    };

    const [commercialTrips, total] = await this.prisma.$transaction([
      this.prisma.commercialTrip.findMany({
        where,
        include: commercialTripDetailsInclude,
        orderBy: [{ expectedDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.commercialTrip.count({ where }),
    ]);

    return {
      commercialTrips: commercialTrips.map(PrismaCommercialTripMapper.toDetails),
      total,
    };
  }

  async update(commercialTrip: CommercialTrip): Promise<CommercialTripDetails> {
    const props = commercialTrip.toObject();
    const updatedCommercialTrip = await this.prisma.$transaction(async (transaction) => {
      await this.replaceLinks(transaction, props);

      return transaction.commercialTrip.update({
        where: {
          id: props.id,
          companyId: props.companyId,
          deletedAt: null,
        },
        data: {
          performedActionDescription: props.performedActionDescription,
          followUpDetails: props.followUpDetails,
          pendingIssuesDescription: props.pendingIssuesDescription,
          status: props.status,
          tripDate: props.tripDate,
          expectedDate: props.expectedDate,
          producerId: props.producerId,
          responsibleId: props.responsibleId,
          updatedAt: props.updatedAt,
          updatedById: props.updatedById,
        },
        include: commercialTripDetailsInclude,
      });
    });

    return PrismaCommercialTripMapper.toDetails(updatedCommercialTrip);
  }

  async delete(commercialTrip: CommercialTrip): Promise<void> {
    const data = commercialTrip.toObject();

    await this.prisma.commercialTrip.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }

  private async replaceLinks(
    transaction: Prisma.TransactionClient,
    props: CommercialTripProps,
  ): Promise<void> {
    const link = { commercialTripId: props.id, companyId: props.companyId };

    await transaction.commercialTripParticipant.deleteMany({ where: link });
    await transaction.commercialTripHarvest.deleteMany({
      where: { commercialTripId: props.id },
    });
    await transaction.productRecommendation.deleteMany({ where: link });
    await transaction.fileCommercialTrip.deleteMany({ where: link });

    await transaction.commercialTripParticipant.createMany({
      data: props.participantIds.map((employeeId) => ({ ...link, employeeId })),
    });
    await transaction.commercialTripHarvest.createMany({
      data: props.harvestIds.map((harvestId) => ({ commercialTripId: props.id, harvestId })),
    });
    await transaction.productRecommendation.createMany({
      data: props.recommendedProductIds.map((productId) => ({ ...link, productId })),
    });
    await transaction.fileCommercialTrip.createMany({
      data: props.fileIds.map((fileId) => ({ ...link, fileId })),
    });
  }
}
