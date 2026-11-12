import { Prisma } from "@prisma/client";

import { CommercialAction } from "../../domain/entities/commercialAction";
import {
  CommercialActionDetails,
  CommercialActionRelation,
} from "../../domain/repositories/commercialAction-repository";

const personName = { select: { id: true, person: { select: { name: true } } } } as const;
const relationName = { select: { id: true, name: true } } as const;

export const commercialActionInclude = {
  producerGuests: {
    where: { producer: { deletedAt: null } },
    select: { producerId: true },
  },
  resellerGuests: {
    where: { reseller: { deletedAt: null } },
    select: { resellerId: true },
  },
  participants: {
    where: { employee: { deletedAt: null } },
    select: { employeeId: true },
  },
  files: {
    where: { file: { deletedAt: null } },
    select: { fileId: true },
  },
} satisfies Prisma.CommercialActionInclude;

export const commercialActionDetailsInclude = {
  producerGuests: {
    where: { producer: { deletedAt: null } },
    select: { producerId: true, producer: personName },
  },
  resellerGuests: {
    where: { reseller: { deletedAt: null } },
    select: { resellerId: true, reseller: relationName },
  },
  participants: {
    where: { employee: { deletedAt: null } },
    select: { employeeId: true, employee: personName },
  },
  files: {
    where: { file: { deletedAt: null } },
    select: {
      fileId: true,
      file: { select: { id: true, originalName: true, mimeType: true, size: true } },
    },
  },
  event: relationName,
  responsible: personName,
  wallet: { select: { id: true, userCompany: { select: { user: { select: { name: true } } } } } },
} satisfies Prisma.CommercialActionInclude;

type PrismaCommercialAction = Prisma.CommercialActionGetPayload<{
  include: typeof commercialActionInclude;
}>;

type PrismaCommercialActionDetails = Prisma.CommercialActionGetPayload<{
  include: typeof commercialActionDetailsInclude;
}>;

type PersonRelation = { id: string; person: { name: string } };

function toRelation({ id, person }: PersonRelation): CommercialActionRelation {
  return { id, name: person.name };
}

function byName(first: CommercialActionRelation, second: CommercialActionRelation): number {
  return first.name.localeCompare(second.name, "pt-BR");
}

export class PrismaCommercialActionMapper {
  static toDomain(raw: PrismaCommercialAction): CommercialAction {
    return CommercialAction.reconstitute({
      id: raw.id,
      description: raw.description,
      eventId: raw.eventId,
      price: raw.price?.toNumber() ?? null,
      initialDate: raw.initialDate,
      finalDate: raw.finalDate,
      walletId: raw.walletId,
      responsibleId: raw.responsibleId,
      companyId: raw.companyId,
      invoiceNumber: raw.invoiceNumber,
      producerGuestIds: raw.producerGuests.map((guest) => guest.producerId),
      resellerGuestIds: raw.resellerGuests.map((guest) => guest.resellerId),
      participantIds: raw.participants.map((participant) => participant.employeeId),
      fileIds: raw.files.map((file) => file.fileId),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({
    event,
    responsible,
    wallet,
    ...raw
  }: PrismaCommercialActionDetails): CommercialActionDetails {
    return {
      commercialAction: PrismaCommercialActionMapper.toDomain(raw),
      event,
      responsible: toRelation(responsible),
      wallet: { id: wallet.id, name: wallet.userCompany.user.name },
      producerGuests: raw.producerGuests.map(({ producer }) => toRelation(producer)).sort(byName),
      resellerGuests: raw.resellerGuests.map(({ reseller }) => reseller).sort(byName),
      participants: raw.participants.map(({ employee }) => toRelation(employee)).sort(byName),
      files: raw.files.map(({ file }) => file),
    };
  }
}
