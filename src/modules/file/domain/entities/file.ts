import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

const BYTES_PER_MEGABYTE = 1024 * 1024;
const MAX_ORIGINAL_NAME_LENGTH = 255;

export const FILE_MAX_SIZE = 10 * BYTES_PER_MEGABYTE;

const FILE_EXTENSIONS_BY_MIME_TYPE = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["text/plain", ".txt"],
  ["text/csv", ".csv"],
  ["application/msword", ".doc"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx",
  ],
  ["application/vnd.ms-excel", ".xls"],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xlsx",
  ],
  ["application/vnd.ms-powerpoint", ".ppt"],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".pptx",
  ],
]);

export interface FileProps {
  id: string;
  originalName: string | null;
  mimeType: string;
  size: number;
  url: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateFileProps {
  originalName: string;
  mimeType: string;
  size: number;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateFileProps {
  originalName?: string;
  updatedById?: string | null;
}

export class File {
  private constructor(private readonly props: FileProps) {}

  static create(
    input: CreateFileProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): File {
    const originalName = File.normalizeOriginalName(input.originalName);
    const mimeType = File.normalizeMimeType(input.mimeType);
    const size = File.normalizeSize(input.size);

    return new File({
      id,
      originalName,
      mimeType,
      size,
      url: `${input.companyId}/${id}${FILE_EXTENSIONS_BY_MIME_TYPE.get(mimeType)}`,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: FileProps): File {
    return new File({ ...props });
  }

  get url(): string {
    return this.props.url;
  }

  update(input: UpdateFileProps, updatedAt = new Date()): void {
    if (input.originalName !== undefined) {
      this.props.originalName = File.normalizeOriginalName(input.originalName);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): FileProps {
    return { ...this.props };
  }

  private static normalizeOriginalName(originalName: string): string {
    if (typeof originalName !== "string") {
      throw new DomainError("O nome do arquivo é obrigatório.");
    }

    const name = (originalName.split(/[\\/]/).pop() ?? "")
      .replace(/\p{Cc}/gu, "")
      .trim();

    if (name.length === 0) {
      throw new DomainError("O nome do arquivo é obrigatório.");
    }

    if (name.length > MAX_ORIGINAL_NAME_LENGTH) {
      throw new DomainError(
        `O nome do arquivo deve ter no máximo ${MAX_ORIGINAL_NAME_LENGTH} caracteres.`,
      );
    }

    return name;
  }

  private static normalizeMimeType(mimeType: string): string {
    const normalizedMimeType =
      typeof mimeType === "string" ? mimeType.trim().toLowerCase() : "";

    if (!FILE_EXTENSIONS_BY_MIME_TYPE.has(normalizedMimeType)) {
      throw new DomainError(
        "Tipo de arquivo não permitido. Envie PDF, imagem (JPG, PNG, WEBP, GIF), texto, CSV, documento, planilha ou apresentação.",
      );
    }

    return normalizedMimeType;
  }

  private static normalizeSize(size: number): number {
    if (!Number.isInteger(size) || size <= 0) {
      throw new DomainError("O arquivo enviado está vazio.");
    }

    if (size > FILE_MAX_SIZE) {
      throw new DomainError(
        `O arquivo excede o tamanho máximo de ${FILE_MAX_SIZE / BYTES_PER_MEGABYTE} MB.`,
      );
    }

    return size;
  }
}
