import { randomUUID } from "node:crypto";

import { DomainError } from "../../../shared/domain/errors/domain-error";

const BYTES_PER_MEGABYTE = 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const INVALID_COMPANY_LOGO = "INVALID_COMPANY_LOGO";
const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

export const COMPANY_LOGO_MAX_SIZE = 2 * BYTES_PER_MEGABYTE;

export interface CompanyLogoFormat {
  extension: string;
  contentType: string;
}

export interface CompanyLogoFile {
  key: string;
  content: Buffer;
}

interface DetectableLogoFormat extends CompanyLogoFormat {
  matches(content: Buffer): boolean;
}

const COMPANY_LOGO_FORMATS: DetectableLogoFormat[] = [
  {
    extension: ".png",
    contentType: "image/png",
    matches: (content) =>
      content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE),
  },
  {
    extension: ".jpg",
    contentType: "image/jpeg",
    matches: (content) =>
      content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff,
  },
  {
    extension: ".webp",
    contentType: "image/webp",
    matches: (content) =>
      content.toString("latin1", 0, 4) === "RIFF" &&
      content.toString("latin1", 8, 12) === "WEBP",
  },
];

export function detectCompanyLogoFormat(content: Buffer): CompanyLogoFormat | null {
  const format = COMPANY_LOGO_FORMATS.find((candidate) => candidate.matches(content));

  return format
    ? { extension: format.extension, contentType: format.contentType }
    : null;
}

export function createCompanyLogoKey(
  companyId: string,
  format: CompanyLogoFormat,
): string {
  return `${companyId}/logo-${randomUUID()}${format.extension}`;
}

export function prepareCompanyLogo(companyId: string, content: Buffer): CompanyLogoFile {
  if (content.length === 0) {
    throw new DomainError("O arquivo enviado está vazio.", INVALID_COMPANY_LOGO);
  }

  const format = detectCompanyLogoFormat(content);

  if (!format) {
    throw new DomainError("Envie a logo em PNG, JPG ou WEBP.", INVALID_COMPANY_LOGO);
  }

  return { key: createCompanyLogoKey(companyId, format), content };
}

export function getCompanyLogoContentType(
  companyId: string,
  key: string,
): string | null {
  const extension = new RegExp(`^${companyId}/logo-${UUID_PATTERN}(\\.[a-z]+)$`).exec(
    key,
  )?.[1];

  return (
    COMPANY_LOGO_FORMATS.find((format) => format.extension === extension)
      ?.contentType ?? null
  );
}

export function isCompanyLogoKey(companyId: string, key: string): boolean {
  return getCompanyLogoContentType(companyId, key) !== null;
}
