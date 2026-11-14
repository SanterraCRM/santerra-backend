import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Wallet } from "../../domain/entities/wallet";
import {
  FindWalletMovementsParams,
  FindWalletMovementsResult,
  FindWalletsParams,
  FindWalletsResult,
  WalletAdjustmentInput,
  WalletAdjustmentResult,
  WalletDetails,
  WalletMovementFilters,
  WalletMovementsSummary,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import {
  ACTIVE_ACTIONS,
  PrismaWalletMapper,
  walletDetailsInclude,
  walletListInclude,
  walletMovementInclude,
} from "./prisma-wallet-mapper";
import { changeWalletBalance } from "./wallet-balance";

const BALANCE_FILTERS: Record<string, Prisma.WalletWhereInput> = {
  empty: { value: { equals: 0 } },
  positive: { value: { gt: 0 } },
};

const DIRECTION_FILTERS: Record<string, Prisma.WalletMovementWhereInput> = {
  credit: { amount: { gt: 0 } },
  debit: { amount: { lt: 0 } },
};

function movementWhere(filters: WalletMovementFilters): Prisma.WalletMovementWhereInput {
  return {
    walletId: filters.walletId,
    companyId: filters.companyId,
    type: filters.type,
    createdAt: { gte: filters.createdFrom, lte: filters.createdTo },
    ...(filters.direction ? DIRECTION_FILTERS[filters.direction] : {}),
    OR: filters.search
      ? [
          { reason: { contains: filters.search, mode: "insensitive" } },
          { commercialAction: { description: { contains: filters.search, mode: "insensitive" } } },
          {
            commercialAction: {
              event: { name: { contains: filters.search, mode: "insensitive" } },
            },
          },
        ]
      : undefined,
  };
}

@injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(wallet: Wallet): Promise<WalletDetails> {
    const data = wallet.toObject();
    const createdWallet = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.wallet.create({ data, include: walletDetailsInclude });

      if (data.value > 0) {
        await transaction.walletMovement.create({
          data: {
            walletId: data.id,
            companyId: data.companyId,
            type: "INITIAL_BALANCE",
            amount: data.value,
            balanceAfter: data.value,
            createdById: data.createdById,
          },
        });
      }

      return created;
    });

    return PrismaWalletMapper.toDetails(createdWallet);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return wallet ? PrismaWalletMapper.toDomain(wallet) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<WalletDetails | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, companyId, deletedAt: null },
      include: walletDetailsInclude,
    });

    return wallet ? PrismaWalletMapper.toDetails(wallet) : null;
  }

  async findByUserCompanyId(userCompanyId: string, companyId: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userCompanyId, companyId, deletedAt: null },
    });

    return wallet ? PrismaWalletMapper.toDomain(wallet) : null;
  }

  async findMany(params: FindWalletsParams): Promise<FindWalletsResult> {
    const where: Prisma.WalletWhereInput = {
      companyId: params.companyId,
      userCompanyId: params.userCompanyId,
      deletedAt: params.includeDeleted ? undefined : null,
      ...(params.balance ? BALANCE_FILTERS[params.balance] : {}),
      userCompany: params.search
        ? {
            user: {
              OR: [
                { name: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
              ],
            },
          }
        : undefined,
    };

    const [wallets, total] = await this.prisma.$transaction([
      this.prisma.wallet.findMany({
        where,
        include: walletListInclude,
        orderBy:
          params.sort === "name"
            ? [{ userCompany: { user: { name: "asc" } } }, { id: "asc" }]
            : { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return {
      wallets: wallets.map(PrismaWalletMapper.toListItem),
      total,
    };
  }

  countActions(id: string, companyId: string): Promise<number> {
    return this.prisma.commercialAction.count({
      where: { walletId: id, companyId, ...ACTIVE_ACTIONS },
    });
  }

  async adjust({
    id,
    companyId,
    amount,
    reason,
    userId,
  }: WalletAdjustmentInput): Promise<WalletAdjustmentResult> {
    const applied = await this.prisma.$transaction((transaction) =>
      changeWalletBalance(transaction, {
        walletId: id,
        companyId,
        amount,
        type: "ADJUSTMENT",
        reason,
        userId,
      }),
    );

    if (applied) {
      return "applied";
    }

    return amount < 0 ? "insufficient_balance" : "exceeds_maximum";
  }

  async findMovements({
    page,
    limit,
    ...filters
  }: FindWalletMovementsParams): Promise<FindWalletMovementsResult> {
    const where = movementWhere(filters);
    const [movements, total] = await this.prisma.$transaction([
      this.prisma.walletMovement.findMany({
        where,
        include: walletMovementInclude,
        orderBy: { sequence: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.walletMovement.count({ where }),
    ]);

    return { movements: movements.map(PrismaWalletMapper.toMovementDetails), total };
  }

  async summarizeMovements(filters: WalletMovementFilters): Promise<WalletMovementsSummary> {
    const where = movementWhere(filters);
    const [credits, debits, count] = await this.prisma.$transaction([
      this.prisma.walletMovement.aggregate({
        where: { AND: [where, DIRECTION_FILTERS.credit] },
        _sum: { amount: true },
      }),
      this.prisma.walletMovement.aggregate({
        where: { AND: [where, DIRECTION_FILTERS.debit] },
        _sum: { amount: true },
      }),
      this.prisma.walletMovement.count({ where }),
    ]);

    return {
      credits: credits._sum.amount?.toNumber() ?? 0,
      debits: Math.abs(debits._sum.amount?.toNumber() ?? 0),
      count,
    };
  }

  async update(wallet: Wallet): Promise<WalletDetails> {
    const data = wallet.toObject();
    const updatedWallet = await this.prisma.wallet.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        userCompanyId: data.userCompanyId,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
      include: walletDetailsInclude,
    });

    return PrismaWalletMapper.toDetails(updatedWallet);
  }

  async delete(wallet: Wallet): Promise<void> {
    const data = wallet.toObject();

    await this.prisma.wallet.update({
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
}
