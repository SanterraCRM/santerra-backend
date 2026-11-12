import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file-repository";
import { DownloadFileResultDto } from "../dtos/download-file-result-dto";

@injectable()
export class DownloadFileUseCase {
  constructor(
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(id: string, context: TenantContext): Promise<DownloadFileResultDto> {
    const file = await this.fileRepository.findById(id, context.companyId);

    if (!file) {
      throw new ResourceNotFoundError("Arquivo não encontrado.");
    }

    const content = await this.storageProvider.read(file.url);

    if (!content) {
      throw new ResourceNotFoundError("O conteúdo do arquivo não foi encontrado.");
    }

    return { file: file.toObject(), content };
  }
}
