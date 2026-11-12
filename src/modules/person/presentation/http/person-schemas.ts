import { z } from "zod";

import {
  createdAtRangeQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";
import { createEmployeeSchema } from "../../../employee/presentation/http/employee-schemas";
import { createProducerSchema } from "../../../producer/presentation/http/producer-schemas";
import {
  PERSON_OPTIONAL_FIELDS,
  PERSON_TYPES,
} from "../../domain/repositories/person-repository";

const personFieldsSchema = z.object({
  name: z.string(),
  nationalId: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  email: z.email().nullish().or(z.literal("")),
});

export const createPersonSchema = personFieldsSchema.extend({
  employee: createEmployeeSchema.omit({ personId: true }).optional(),
  producer: createProducerSchema.omit({ personId: true }).optional(),
});

export const updatePersonSchema = personFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listPersonsQuerySchema = listQuerySchema.extend({
  type: z.enum(PERSON_TYPES).optional(),
  ...createdAtRangeQuerySchema.shape,
  // Lista separada por vírgula: ?missing=email,phoneNumber
  missing: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(z.enum(PERSON_OPTIONAL_FIELDS)))
    .optional(),
});
