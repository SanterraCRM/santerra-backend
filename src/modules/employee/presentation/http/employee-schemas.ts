import { z } from "zod";

import {
  booleanQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

export const createEmployeeSchema = z.object({
  personId: z.uuid(),
  userCompanyId: z.uuid().nullish(),
  hiredAt: z.coerce.date().nullish(),
  terminatedAt: z.coerce.date().nullish(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listEmployeesQuerySchema = listQuerySchema.extend({
  active: booleanQuerySchema.optional(),
});
