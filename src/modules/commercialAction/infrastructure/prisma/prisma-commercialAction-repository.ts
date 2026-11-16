import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { changeWalletBalance, InsufficientBalanceError } from "../../../wallet";
import {
  CommercialAction,
  CommercialActionProps,
  WalletCharge,
} from "../../domain/entities/commercialAction";
import {
  CommercialActionDetails,
  CommercialActionRepository,
  FindCommercialActionsParams,
  FindCommercialActionsResult,
} from "../../domain/repositories/commercialAction-repository";
import {
  commercialActionDetailsInclude,
  commercialActionInclude,
  PrismaCommercialActionMapper,
  ResellerNames,
} from "./prisma-commercialAction-mapper";

type ResellerGuestRows = { resellerGuests: { resellerId: number }[] }[];

@injectable()
export class PrismaCommercialActionRepository implements CommercialActionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(commercialAction: CommercialAction): Promise<CommercialActionDetails> {
    const props = commercialAction.toObject();
    const {
      producerGuestIds: _producerGuestIds,
      resellerGuestIds: _resellerGuestIds,
      participantIds: _participantIds,
      fileIds: _fileIds,
      ...data
    } = props;
    const createdCommercialAction = await this.prisma.$transaction(async (transaction) => {
      await transaction.commercialAction.create({ data });
      await this.debit(transaction, commercialAction.charge, data.companyId, data.id, data.createdById);
      await this.replaceLinks(transaction, props);

      return transaction.commercialAction.findUniqueOrThrow({
        where: { id: data.id },
        include: commercialActionDetailsInclude,
      });
    });

    return this.toDetails(createdCommercialAction);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<CommercialAction | null> {
    const commercialAction = await this.prisma.commercialAction.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: commercialActionInclude,
    });

    return commercialAction ? PrismaCommercialActionMapper.toDomain(commercialAction) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<CommercialActionDetails | null> {
    const commercialAction = await this.prisma.commercialAction.findFirst({
      where: { id, companyId, deletedAt: null },
      include: commercialActionDetailsInclude,
    });

    return commercialAction ? this.toDetails(commercialAction) : null;
  }

  async findMany(params: FindCommercialActionsParams): Promise<FindCommercialActionsResult> {
    const where: Prisma.CommercialActionWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      eventId: params.eventId,
      responsibleId: params.responsibleId,
      walletId: params.walletId,
      initialDate: { gte: params.initialFrom, lte: params.initialTo },
      OR: params.search
        ? [
            { event: { name: { contains: params.search, mode: "insensitive" } } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [commercialActions, total] = await this.prisma.$transaction([
      this.prisma.commercialAction.findMany({
        where,
        include: commercialActionDetailsInclude,
        orderBy: [{ initialDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.commercialAction.count({ where }),
    ]);

    const resellerNames = await this.findResellerNames(commercialActions);

    return {
      commercialActions: commercialActions.map((commercialAction) =>
        PrismaCommercialActionMapper.toDetails(commercialAction, resellerNames),
      ),
      total,
    };
  }

  async update(
    commercialAction: CommercialAction,
    previousCharge: WalletCharge,
  ): Promise<CommercialActionDetails> {
    const props = commercialAction.toObject();
    const charge = commercialAction.charge;
    const updatedCommercialAction = await this.prisma.$transaction(async (transaction) => {
      if (
        charge.walletId !== previousCharge.walletId ||
        charge.amount !== previousCharge.amount
      ) {
        await this.refund(transaction, previousCharge, props.companyId, props.id, props.updatedById);
        await this.debit(transaction, charge, props.companyId, props.id, props.updatedById);
      }

      await this.replaceLinks(transaction, props);

      return transaction.commercialAction.update({
        where: {
          id: props.id,
          companyId: props.companyId,
          deletedAt: null,
        },
        data: {
          description: props.description,
          eventId: props.eventId,
          price: props.price,
          initialDate: props.initialDate,
          finalDate: props.finalDate,
          walletId: props.walletId,
          responsibleId: props.responsibleId,
          invoiceNumber: props.invoiceNumber,
          updatedAt: props.updatedAt,
          updatedById: props.updatedById,
        },
        include: commercialActionDetailsInclude,
      });
    });

    return this.toDetails(updatedCommercialAction);
  }

  private async toDetails(
    commercialAction: Parameters<typeof PrismaCommercialActionMapper.toDetails>[0],
  ): Promise<CommercialActionDetails> {
    const resellerNames = await this.findResellerNames([commercialAction]);

    return PrismaCommercialActionMapper.toDetails(commercialAction, resellerNames);
  }

  private async findResellerNames(commercialActions: ResellerGuestRows): Promise<ResellerNames> {
    const ids = [
      ...new Set(
        commercialActions.flatMap(({ resellerGuests }) =>
          resellerGuests.map(({ resellerId }) => resellerId),
        ),
      ),
    ];

    if (ids.length === 0) {
      return new Map();
    }

    const resellers = await this.prisma.resellersView.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, fantasyName: true },
    });

    return new Map(
      resellers.flatMap(({ id, name, fantasyName }) => {
        const label = name?.trim() || fantasyName?.trim();

        return id === null || !label ? [] : [[id, label] as const];
      }),
    );
  }

  async delete(commercialAction: CommercialAction): Promise<void> {
    const data = commercialAction.toObject();

    await this.prisma.$transaction(async (transaction) => {
      await transaction.commercialAction.update({
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

      await this.refund(
        transaction,
        commercialAction.charge,
        data.companyId,
        data.id,
        data.deletedById,
      );
    });
  }

  private async replaceLinks(
    transaction: Prisma.TransactionClient,
    props: CommercialActionProps,
  ): Promise<void> {
    const link = { commercialActionId: props.id, companyId: props.companyId };

    await transaction.commercialActionProducerGuest.deleteMany({ where: link });
    await transaction.commercialActionResellerGuest.deleteMany({ where: link });
    await transaction.commercialActionParticipant.deleteMany({ where: link });
    await transaction.fileCommercialAction.deleteMany({ where: link });

    await transaction.commercialActionProducerGuest.createMany({
      data: props.producerGuestIds.map((producerId) => ({ ...link, producerId })),
    });
    await transaction.commercialActionResellerGuest.createMany({
      data: props.resellerGuestIds.map((resellerId) => ({ ...link, resellerId })),
    });
    await transaction.commercialActionParticipant.createMany({
      data: props.participantIds.map((employeeId) => ({ ...link, employeeId })),
    });
    await transaction.fileCommercialAction.createMany({
      data: props.fileIds.map((fileId) => ({ ...link, fileId })),
    });
  }

  private async debit(
    transaction: Prisma.TransactionClient,
    charge: WalletCharge,
    companyId: string,
    commercialActionId: string,
    userId: string | null,
  ): Promise<void> {
    if (charge.amount === 0) {
      return;
    }

    const debited = await changeWalletBalance(transaction, {
      walletId: charge.walletId,
      companyId,
      amount: -charge.amount,
      type: "ACTION_DEBIT",
      commercialActionId,
      userId,
    });

    if (!debited) {
      throw new InsufficientBalanceError();
    }
  }

  private async refund(
    transaction: Prisma.TransactionClient,
    charge: WalletCharge,
    companyId: string,
    commercialActionId: string,
    userId: string | null,
  ): Promise<void> {
    if (charge.amount === 0) {
      return;
    }

    await changeWalletBalance(transaction, {
      walletId: charge.walletId,
      companyId,
      amount: charge.amount,
      type: "ACTION_REFUND",
      commercialActionId,
      userId,
      enforceLimits: false,
    });
  }
}
