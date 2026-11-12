import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

export const createRoleSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  permissionIds: z.array(z.uuid()).optional(),
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listRolesQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
});
