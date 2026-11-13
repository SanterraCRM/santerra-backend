import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
  sortQuerySchema,
} from "../../../../shared/http/request-schemas";
import { MANUFACTURER_OPTIONAL_FIELDS } from "../../domain/repositories/manufacturer-repository";

export const createManufacturerSchema = z.object({
  name: z.string(),
  registrationNumber: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  email: z.email().nullish().or(z.literal("")),
});

export const updateManufacturerSchema = createManufacturerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listManufacturersQuerySchema = listQuerySchema.extend({
  ...createdAtRangeQuerySchema.shape,
  ...sortQuerySchema.shape,
  missing: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(z.enum(MANUFACTURER_OPTIONAL_FIELDS)))
    .optional(),
});
