import { RequestHandler } from "express";
import multer, { MulterError } from "multer";

import {
  AppError,
  PayloadTooLargeError,
  ValidationError,
} from "../../errors/app-error";

const BYTES_PER_MEGABYTE = 1024 * 1024;

interface UploadSingleFileOptions {
  maxFields?: number;
}

export function uploadSingleFile(
  fieldName: string,
  maxFileSize: number,
  { maxFields = 0 }: UploadSingleFileOptions = {},
): RequestHandler {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize, files: 1, fields: maxFields },
    defParamCharset: "utf8",
  }).single(fieldName);

  return (request, response, next) => {
    upload(request, response, (error: unknown) => {
      if (error instanceof MulterError) {
        next(toAppError(error, fieldName, maxFileSize, maxFields));
        return;
      }

      next(error);
    });
  };
}

function toAppError(
  error: MulterError,
  fieldName: string,
  maxFileSize: number,
  maxFields: number,
): AppError {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return new PayloadTooLargeError(
        `O arquivo excede o tamanho máximo de ${maxFileSize / BYTES_PER_MEGABYTE} MB.`,
      );
    case "LIMIT_FILE_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
      return new ValidationError(`Envie um único arquivo no campo "${fieldName}".`);
    case "LIMIT_FIELD_COUNT":
      return new ValidationError(
        maxFields === 0
          ? `Envie somente o arquivo no campo "${fieldName}", sem outros campos.`
          : `Envie no máximo ${maxFields} campos além do arquivo.`,
      );
    default:
      return new ValidationError("Não foi possível processar o arquivo enviado.");
  }
}
