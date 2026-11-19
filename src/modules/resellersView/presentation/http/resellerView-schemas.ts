import { z } from "zod";

import {
  booleanQuerySchema,
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";
import { RESELLER_VIEW_MISSING_FIELDS } from "../../domain/repositories/resellerView-repository";

// O código do cliente na view é numérico (cd_clien), não uuid.
export const resellerViewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listResellersViewQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
  isActive: booleanQuerySchema.optional(),
  ...createdAtRangeQuerySchema.shape,
  missing: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(z.enum(RESELLER_VIEW_MISSING_FIELDS)))
    .optional(),
});
