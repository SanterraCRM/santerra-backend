import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file-repository";

@injectable()
export class DeleteFileUseCase {
  constructor(
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const file = await this.fileRepository.findById(id, context.companyId);

    if (!file) {
      throw new ResourceNotFoundError("Arquivo não encontrado.");
    }

    file.delete(context.userId);
    await this.fileRepository.delete(file);
  }
}
