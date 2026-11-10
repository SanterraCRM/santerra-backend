import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";
import { WALLET_MAX_VALUE } from "../../domain/entities/wallet";
import { WALLET_BALANCES } from "../../domain/repositories/wallet-repository";

export const createWalletSchema = z.object({
  value: z.number().min(0).max(WALLET_MAX_VALUE).optional(),
  userCompanyId: z.uuid(),
});

export const updateWalletSchema = z
  .object({ userCompanyId: z.uuid() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const creditWalletSchema = z.object({
  amount: z.number(),
});

export const listWalletsQuerySchema = listQuerySchema.extend({
  userCompanyId: z.uuid().optional(),
  balance: z.enum(WALLET_BALANCES).optional(),
});
