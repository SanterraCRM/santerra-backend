import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FileProps } from "../../domain/entities/file";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file-repository";

@injectable()
export class GetFileUseCase {
  constructor(
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<FileProps> {
    const file = await this.fileRepository.findById(id, context.companyId);

    if (!file) {
      throw new ResourceNotFoundError("Arquivo não encontrado.");
    }

    return file.toObject();
  }
}
