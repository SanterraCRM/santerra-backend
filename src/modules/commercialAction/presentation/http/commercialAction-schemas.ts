import { z } from "zod";

import { dateTimeQuerySchema, listQuerySchema } from "../../../../shared/http/request-schemas";

export const createCommercialActionSchema = z.object({
  description: z.string().nullish(),
  eventId: z.uuid(),
  price: z.number().nullish(),
  initialDate: z.coerce.date().nullish(),
  finalDate: z.coerce.date().nullish(),
  walletId: z.uuid(),
  responsibleId: z.uuid(),
  invoiceNumber: z.string().nullish(),
  producerGuestIds: z.array(z.uuid()).optional(),
  resellerGuestIds: z.array(z.uuid()).optional(),
  participantIds: z.array(z.uuid()).optional(),
  fileIds: z.array(z.uuid()).optional(),
});

export const updateCommercialActionSchema = createCommercialActionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const listCommercialActionsQuerySchema = listQuerySchema.extend({
  eventId: z.uuid().optional(),
  responsibleId: z.uuid().optional(),
  walletId: z.uuid().optional(),
  initialFrom: dateTimeQuerySchema.optional(),
  initialTo: dateTimeQuerySchema.optional(),
});
