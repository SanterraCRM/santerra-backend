import { Prisma, Wallet as PrismaWallet } from "@prisma/client";

import { Wallet } from "../../domain/entities/wallet";
import {
  WalletDetails,
  WalletListItem,
  WalletMovementDetails,
} from "../../domain/repositories/wallet-repository";

export const ACTIVE_ACTIONS = { deletedAt: null };

export const walletDetailsInclude = {
  userCompany: { select: { id: true, user: { select: { name: true, email: true } } } },
} satisfies Prisma.WalletInclude;

export const walletListInclude = {
  ...walletDetailsInclude,
  _count: { select: { commercialActions: { where: ACTIVE_ACTIONS } } },
} satisfies Prisma.WalletInclude;

export const walletMovementInclude = {
  createdBy: { select: { id: true, name: true } },
  commercialAction: {
    select: {
      id: true,
      description: true,
      deletedAt: true,
      event: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.WalletMovementInclude;

type PrismaWalletDetails = Prisma.WalletGetPayload<{ include: typeof walletDetailsInclude }>;
type PrismaWalletListItem = Prisma.WalletGetPayload<{ include: typeof walletListInclude }>;
type PrismaWalletMovement = Prisma.WalletMovementGetPayload<{
  include: typeof walletMovementInclude;
}>;

export class PrismaWalletMapper {
  static toDomain(raw: PrismaWallet): Wallet {
    return Wallet.reconstitute({
      id: raw.id,
      value: raw.value.toNumber(),
      userCompanyId: raw.userCompanyId,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ userCompany, ...raw }: PrismaWalletDetails): WalletDetails {
    return {
      wallet: PrismaWalletMapper.toDomain(raw),
      member: { id: userCompany.id, name: userCompany.user.name, email: userCompany.user.email },
    };
  }

  static toListItem({ _count, ...raw }: PrismaWalletListItem): WalletListItem {
    return { ...PrismaWalletMapper.toDetails(raw), actionsCount: _count.commercialActions };
  }

  static toMovementDetails({
    createdBy,
    commercialAction,
    ...raw
  }: PrismaWalletMovement): WalletMovementDetails {
    return {
      movement: {
        id: raw.id,
        sequence: raw.sequence,
        walletId: raw.walletId,
        companyId: raw.companyId,
        type: raw.type,
        amount: raw.amount.toNumber(),
        balanceAfter: raw.balanceAfter.toNumber(),
        reason: raw.reason,
        commercialActionId: raw.commercialActionId,
        createdAt: raw.createdAt,
        createdById: raw.createdById,
      },
      createdBy,
      commercialAction,
    };
  }
}
