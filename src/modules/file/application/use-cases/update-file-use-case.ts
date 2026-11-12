import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FileProps } from "../../domain/entities/file";
import {
  FILE_REPOSITORY,
  FileRepository,
} from "../../domain/repositories/file-repository";
import { UpdateFileDto } from "../dtos/update-file-dto";

@injectable()
export class UpdateFileUseCase {
  constructor(
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateFileDto,
    context: TenantContext,
  ): Promise<FileProps> {
    const file = await this.fileRepository.findById(id, context.companyId);

    if (!file) {
      throw new ResourceNotFoundError("Arquivo não encontrado.");
    }

    file.update({ ...input, updatedById: context.userId });
    const updatedFile = await this.fileRepository.update(file);

    return updatedFile.toObject();
  }
}
