import { z } from "zod";

export const COMPANY_LOGO_FIELD_NAME = "file";

export const createCompanySchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  ownerEmail: z.email(),
});

export const updateCompanySchema = z
  .object({
    name: z.string(),
    description: z.string().nullish(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const companyLogoQuerySchema = z.object({
  v: z.string().optional(),
});
