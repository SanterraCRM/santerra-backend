import { Readable } from "node:stream";

export const STORAGE_PROVIDER = "StorageProvider";

export interface StorageProvider {
  save(key: string, content: Buffer): Promise<void>;
  read(key: string): Promise<Readable | null>;
  delete(key: string): Promise<void>;
}
