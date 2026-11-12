import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { File, FileProps } from "../../domain/entities/file";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file-repository";
import { CreateFileDto } from "../dtos/create-file-dto";

@injectable()
export class CreateFileUseCase {
  constructor(
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(
    input: CreateFileDto,
    context: TenantContext,
  ): Promise<FileProps> {
    const file = File.create({
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.content.length,
      companyId: context.companyId,
      createdById: context.userId,
    });

    await this.storageProvider.save(file.url, input.content);

    try {
      const createdFile = await this.fileRepository.create(file);

      return createdFile.toObject();
    } catch (error) {
      await this.storageProvider.delete(file.url).catch(() => undefined);
      throw error;
    }
  }
}
