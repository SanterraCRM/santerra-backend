import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";

const textFilterSchema = z.string().trim().min(1).optional();

export const pogPocIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listPogPocsQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
  cnpj: textFilterSchema,
  regiao: textFilterSchema,
});
