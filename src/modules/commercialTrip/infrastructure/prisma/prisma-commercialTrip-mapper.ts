import { Prisma } from "@prisma/client";

import { CommercialTrip } from "../../domain/entities/commercialTrip";
import {
  CommercialTripDetails,
  CommercialTripRelation,
} from "../../domain/repositories/commercialTrip-repository";
import { CommercialTripStatus } from "../../enumCommercialTrip/EnumCommercialTrip";

const personName = { select: { id: true, person: { select: { name: true } } } } as const;

export const commercialTripInclude = {
  participants: {
    where: { employee: { deletedAt: null } },
    select: { employeeId: true },
  },
  harvests: {
    where: { harvest: { deletedAt: null } },
    select: { harvestId: true },
  },
  recommendations: {
    where: { product: { deletedAt: null } },
    select: { productId: true },
  },
  files: {
    where: { file: { deletedAt: null } },
    select: { fileId: true },
  },
} satisfies Prisma.CommercialTripInclude;

export const commercialTripDetailsInclude = {
  participants: {
    where: { employee: { deletedAt: null } },
    select: { employeeId: true, employee: personName },
  },
  harvests: {
    where: { harvest: { deletedAt: null } },
    select: { harvestId: true, harvest: { select: { id: true, name: true } } },
  },
  recommendations: {
    where: { product: { deletedAt: null } },
    select: { productId: true, product: { select: { id: true, name: true } } },
  },
  files: {
    where: { file: { deletedAt: null } },
    select: {
      fileId: true,
      file: { select: { id: true, originalName: true, mimeType: true, size: true } },
    },
  },
  producer: personName,
  responsible: personName,
} satisfies Prisma.CommercialTripInclude;

type PrismaCommercialTrip = Prisma.CommercialTripGetPayload<{
  include: typeof commercialTripInclude;
}>;

type PrismaCommercialTripDetails = Prisma.CommercialTripGetPayload<{
  include: typeof commercialTripDetailsInclude;
}>;

type PersonRelation = { id: string; person: { name: string } };

function toRelation({ id, person }: PersonRelation): CommercialTripRelation {
  return { id, name: person.name };
}

function byName(first: CommercialTripRelation, second: CommercialTripRelation): number {
  return first.name.localeCompare(second.name, "pt-BR");
}

export class PrismaCommercialTripMapper {
  static toDomain(raw: PrismaCommercialTrip): CommercialTrip {
    return CommercialTrip.reconstitute({
      id: raw.id,
      performedActionDescription: raw.performedActionDescription,
      followUpDetails: raw.followUpDetails,
      pendingIssuesDescription: raw.pendingIssuesDescription,
      status: raw.status as CommercialTripStatus,
      tripDate: raw.tripDate,
      expectedDate: raw.expectedDate,
      producerId: raw.producerId,
      responsibleId: raw.responsibleId,
      companyId: raw.companyId,
      participantIds: raw.participants.map((participant) => participant.employeeId),
      harvestIds: raw.harvests.map((harvest) => harvest.harvestId),
      recommendedProductIds: raw.recommendations.map((recommendation) => recommendation.productId),
      fileIds: raw.files.map((file) => file.fileId),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ producer, responsible, ...raw }: PrismaCommercialTripDetails): CommercialTripDetails {
    return {
      commercialTrip: PrismaCommercialTripMapper.toDomain(raw),
      producer: toRelation(producer),
      responsible: toRelation(responsible),
      participants: raw.participants.map(({ employee }) => toRelation(employee)).sort(byName),
      harvests: raw.harvests.map(({ harvest }) => harvest).sort(byName),
      recommendedProducts: raw.recommendations.map(({ product }) => product).sort(byName),
      files: raw.files.map(({ file }) => file),
    };
  }
}
