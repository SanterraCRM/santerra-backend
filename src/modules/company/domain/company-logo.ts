import { randomUUID } from "node:crypto";

const BYTES_PER_MEGABYTE = 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

export const COMPANY_LOGO_MAX_SIZE = 2 * BYTES_PER_MEGABYTE;

export interface CompanyLogoFormat {
  extension: string;
  contentType: string;
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
