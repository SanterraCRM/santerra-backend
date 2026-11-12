import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

const MAX_PRICE = 999_999_999_999.99;

const priceSchema = z.number().min(0).max(MAX_PRICE).nullish();

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  price: priceSchema,
  costPrice: priceSchema,
  manufacturerId: z.uuid(),
  groupIds: z.array(z.uuid()).optional(),
  fileIds: z.array(z.uuid()).optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listProductsQuerySchema = listQuerySchema.extend({
  manufacturerId: z.uuid().optional(),
  groupId: z.uuid().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  ...createdAtRangeQuerySchema.shape,
});
