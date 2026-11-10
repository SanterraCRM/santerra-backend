import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

export const createHarvestSchema = z.object({
  name: z.string(),
});

export const updateHarvestSchema = createHarvestSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listHarvestsQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
});
