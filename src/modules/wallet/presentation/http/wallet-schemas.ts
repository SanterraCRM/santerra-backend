import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
  sortQuerySchema,
} from "../../../../shared/http/request-schemas";
import { WALLET_MAX_VALUE } from "../../domain/entities/wallet";
import {
  WALLET_MOVEMENT_DIRECTIONS,
  WALLET_MOVEMENT_TYPES,
} from "../../domain/entities/wallet-movement";
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

export const adjustWalletSchema = z.object({
  direction: z.enum(WALLET_MOVEMENT_DIRECTIONS),
  amount: z.number(),
  reason: z.string(),
});

export const listWalletsQuerySchema = listQuerySchema.extend({
  userCompanyId: z.uuid().optional(),
  balance: z.enum(WALLET_BALANCES).optional(),
  ...sortQuerySchema.shape,
});

export const listWalletMovementsQuerySchema = listQuerySchema.extend({
  type: z.enum(WALLET_MOVEMENT_TYPES).optional(),
  direction: z.enum(WALLET_MOVEMENT_DIRECTIONS).optional(),
  ...createdAtRangeQuerySchema.shape,
});
