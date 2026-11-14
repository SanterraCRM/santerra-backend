import { z } from "zod";

import { LIST_SORTS } from "../domain/list-sort";

const MAX_LIMIT = 100;
const MIN_PASSWORD_LENGTH = 8;

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH);

export const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
  search: z.string().optional(),
  includeDeleted: booleanQuerySchema.optional(),
});

// A data vem com fuso (ex.: 2026-11-05T00:00:00-03:00): quem chama decide onde o dia começa.
export const dateTimeQuerySchema = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value));

// Filtro "Data de cadastro" das listas: listQuerySchema.extend({ ...createdAtRangeQuerySchema.shape }).
export const createdAtRangeQuerySchema = z.object({
  createdFrom: dateTimeQuerySchema.optional(),
  createdTo: dateTimeQuerySchema.optional(),
});

export const sortQuerySchema = z.object({
  sort: z.enum(LIST_SORTS).optional(),
});
