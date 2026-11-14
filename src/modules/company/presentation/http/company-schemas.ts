import { z } from "zod";

import {
  booleanQuerySchema,
  listQuerySchema,
} from "../../../../shared/http/request-schemas";

export const COMPANY_LOGO_FIELD_NAME = "file";

const AT_LEAST_ONE_FIELD = {
  message: "Informe ao menos um campo para atualizar.",
};

const companyFieldsSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});

export const createCompanySchema = companyFieldsSchema.extend({
  ownerEmail: z.email(),
});

export const CREATE_COMPANY_FORM_FIELDS = Object.keys(createCompanySchema.shape).length;

export const updateCompanySchema = companyFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, AT_LEAST_ONE_FIELD);

export const updatePlatformCompanySchema = companyFieldsSchema
  .extend({ active: z.boolean() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, AT_LEAST_ONE_FIELD);

export const listCompaniesQuerySchema = listQuerySchema.extend({
  active: booleanQuerySchema.optional(),
});

export const deactivateCompanySchema = z.object({
  password: z.string().min(1, "Informe a sua senha para inativar a empresa."),
});

export const companyLogoQuerySchema = z.object({
  v: z.string().optional(),
});
