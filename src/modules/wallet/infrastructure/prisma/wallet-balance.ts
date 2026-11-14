import { Prisma } from "@prisma/client";

import { WALLET_MAX_VALUE } from "../../domain/entities/wallet";
import { WalletMovementType } from "../../domain/entities/wallet-movement";

export interface WalletBalanceChange {
  walletId: string;
  companyId: string;
  amount: number;
  type: WalletMovementType;
  reason?: string | null;
  commercialActionId?: string | null;
  userId?: string | null;
  enforceLimits?: boolean;
}

function limitFor(amount: number): Prisma.DecimalFilter<"Wallet"> {
  return amount < 0
    ? { gte: Math.abs(amount) }
    : { lte: new Prisma.Decimal(WALLET_MAX_VALUE).minus(amount) };
}

export async function changeWalletBalance(
  transaction: Prisma.TransactionClient,
  { enforceLimits = true, ...change }: WalletBalanceChange,
): Promise<boolean> {
  const { count } = await transaction.wallet.updateMany({
    where: {
      id: change.walletId,
      companyId: change.companyId,
      ...(enforceLimits && { deletedAt: null, value: limitFor(change.amount) }),
    },
    data: { value: { increment: change.amount }, updatedAt: new Date() },
  });

  if (count === 0) {
    return false;
  }

  const { value } = await transaction.wallet.findUniqueOrThrow({
    where: { id: change.walletId },
    select: { value: true },
  });

  await transaction.walletMovement.create({
    data: {
      walletId: change.walletId,
      companyId: change.companyId,
      type: change.type,
      amount: change.amount,
      balanceAfter: value,
      reason: change.reason ?? null,
      commercialActionId: change.commercialActionId ?? null,
      createdById: change.userId ?? null,
    },
  });

  return true;
}
