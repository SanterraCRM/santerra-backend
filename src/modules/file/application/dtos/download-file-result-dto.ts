import { Readable } from "node:stream";

import { FileProps } from "../../domain/entities/file";

export interface DownloadFileResultDto {
  file: FileProps;
  content: Readable;
}
