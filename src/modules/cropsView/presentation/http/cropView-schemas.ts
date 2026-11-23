import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";

export const listCropsViewQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
});

export const cropViewParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const cropViewQuerySchema = z.object({
  crop: z.string().trim().min(1),
});
