import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

export const createGroupSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});

export const updateGroupSchema = createGroupSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listGroupsQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
});
