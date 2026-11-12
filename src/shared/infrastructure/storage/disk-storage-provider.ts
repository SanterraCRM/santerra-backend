import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { injectable } from "tsyringe";

import { StorageProvider } from "../../application/storage/storage-provider";

const DEFAULT_STORAGE_DIR = "uploads";

@injectable()
export class DiskStorageProvider implements StorageProvider {
  private readonly root = path.resolve(process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR);

  async save(key: string, content: Buffer): Promise<void> {
    const filePath = this.resolvePath(key);

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, { flag: "wx" });
  }

  async read(key: string): Promise<Readable | null> {
    const filePath = this.resolvePath(key);

    try {
      if (!(await stat(filePath)).isFile()) {
        return null;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }

    return createReadStream(filePath);
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolvePath(key), { force: true });
  }

  private resolvePath(key: string): string {
    const filePath = path.resolve(this.root, key);

    if (!filePath.startsWith(this.root + path.sep)) {
      throw new Error(`Chave de armazenamento fora do diretório de arquivos: ${key}`);
    }

    return filePath;
  }
}
