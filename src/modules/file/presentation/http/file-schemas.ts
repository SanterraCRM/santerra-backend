import { z } from "zod";

export const FILE_FIELD_NAME = "file";

export const updateFileSchema = z
  .object({
    originalName: z.string(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });
