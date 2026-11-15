import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";

export const listResellersViewQuerySchema = listQuerySchema.extend({
  search: z.string().trim().optional(),
});