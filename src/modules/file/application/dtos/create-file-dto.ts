export interface CreateFileDto {
  originalName: string;
  mimeType: string;
  content: Buffer;
}
