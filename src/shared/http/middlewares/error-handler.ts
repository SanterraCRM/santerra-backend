import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { DomainError } from "../../domain/errors/domain-error";
import { AppError } from "../../errors/app-error";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Os dados da requisição são inválidos.",
        details: error.issues.map((issue) => ({
          field: issue.path.join(".") || null,
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof DomainError) {
    response.status(400).json({
      error: {
        code: error.code ?? "VALIDATION_ERROR",
        message: error.message,
      },
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "O corpo da requisição contém um JSON inválido.",
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      response.status(400).json({
        error: {
          code: "INVALID_REFERENCE",
          message: "Uma das referências informadas não existe.",
        },
      });
      return;
    }

    if (error.code === "P2002") {
      response.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Já existe um registro com os dados informados.",
        },
      });
      return;
    }

    if (error.code === "P2025") {
      response.status(404).json({
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Registro não encontrado.",
        },
      });
      return;
    }
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocorreu um erro interno no servidor.",
    },
  });
};
