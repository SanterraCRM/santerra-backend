import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";
import { RESELLER_OPTIONAL_FIELDS } from "../../domain/repositories/reseller-repository";

export const createResellerSchema = z.object({
  name: z.string(),
  registrationNumber: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  email: z.email().nullish().or(z.literal("")),
});

export const updateResellerSchema = createResellerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listResellersQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
  missing: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(z.enum(RESELLER_OPTIONAL_FIELDS)))
    .optional(),
});
