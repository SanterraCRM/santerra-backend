import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Wallet, WALLET_MAX_VALUE } from "../../domain/entities/wallet";
import {
  FindWalletsParams,
  FindWalletsResult,
  WalletDetails,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import {
  ACTIVE_ACTIONS,
  PrismaWalletMapper,
  walletDetailsInclude,
  walletListInclude,
} from "./prisma-wallet-mapper";

const BALANCE_FILTERS: Record<string, Prisma.WalletWhereInput> = {
  empty: { value: { equals: 0 } },
  positive: { value: { gt: 0 } },
};

@injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(wallet: Wallet): Promise<WalletDetails> {
    const data = wallet.toObject();
    const createdWallet = await this.prisma.wallet.create({ data, include: walletDetailsInclude });

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

  async credit(
    id: string,
    companyId: string,
    amount: number,
    updatedById: string,
  ): Promise<boolean> {
    const { count } = await this.prisma.wallet.updateMany({
      where: {
        id,
        companyId,
        deletedAt: null,
        value: { lte: new Prisma.Decimal(WALLET_MAX_VALUE).minus(amount) },
      },
      data: {
        value: { increment: amount },
        updatedAt: new Date(),
        updatedById,
      },
    });

    return count === 1;
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
