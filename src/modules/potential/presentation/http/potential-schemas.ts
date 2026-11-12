import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

const MAX_NUMERIC_VALUE = 9_999_999_999.99;

export const createPotentialSchema = z.object({
  name: z.string(),
  numericValue: z.number().min(0).max(MAX_NUMERIC_VALUE).nullish(),
  description: z.string().nullish(),
});

export const updatePotentialSchema = createPotentialSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listPotentialsQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
});
