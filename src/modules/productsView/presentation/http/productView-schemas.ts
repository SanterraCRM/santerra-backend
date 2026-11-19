import { z } from "zod";

import {
  booleanQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

const textFilterSchema = z.string().trim().min(1).optional();

// O código do produto na view é numérico (cd_prod), não uuid.
export const productViewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listProductsViewQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
  isActive: booleanQuerySchema.optional(),
  manufacturerId: textFilterSchema,
  department: textFilterSchema,
  section: textFilterSchema,
  category: textFilterSchema,
  line: textFilterSchema,
  crop: textFilterSchema,
});
