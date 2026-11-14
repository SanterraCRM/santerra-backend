import { z } from "zod";

import {
  booleanQuerySchema,
  listQuerySchema,
  sortQuerySchema,
} from "../../../../shared/http/request-schemas";

export const updateMemberSchema = z
  .object({
    active: z.boolean().optional(),
    roleIds: z.array(z.uuid()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listMembersQuerySchema = listQuerySchema.extend({
  active: booleanQuerySchema.optional(),
  roleId: z.uuid().optional(),
  hasWallet: booleanQuerySchema.optional(),
  ...sortQuerySchema.shape,
});
