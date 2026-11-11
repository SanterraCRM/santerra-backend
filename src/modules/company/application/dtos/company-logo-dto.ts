import { Readable } from "node:stream";

export interface CompanyLogoDto {
  content: Readable;
  contentType: string;
  version: string;
}
