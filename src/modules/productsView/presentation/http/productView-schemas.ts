import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";

export const listProductsViewQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
});