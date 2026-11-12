import { z } from "zod";

import { listQuerySchema } from "../../../../shared/http/request-schemas";

export const createProducerSchema = z.object({
  personId: z.uuid(),
  potentialId: z.uuid(),
  address: z.string().nullish(),
  mainCrop: z.string().nullish(),
  totalArea: z.number().nullish(),
});

export const updateProducerSchema = createProducerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listProducersQuerySchema = listQuerySchema.extend({
  potentialId: z.uuid().optional(),
});
