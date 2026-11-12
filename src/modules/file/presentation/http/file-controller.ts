import { RequestHandler } from "express";
import { pipeline } from "node:stream/promises";
import { injectable } from "tsyringe";

import { ValidationError } from "../../../../shared/errors/app-error";
import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema, listQuerySchema } from "../../../../shared/http/request-schemas";
import { CreateFileUseCase } from "../../application/use-cases/create-file-use-case";
import { DeleteFileUseCase } from "../../application/use-cases/delete-file-use-case";
import { DownloadFileUseCase } from "../../application/use-cases/download-file-use-case";
import { GetFileUseCase } from "../../application/use-cases/get-file-use-case";
import { ListFilesUseCase } from "../../application/use-cases/list-files-use-case";
import { UpdateFileUseCase } from "../../application/use-cases/update-file-use-case";
import { FILE_FIELD_NAME, updateFileSchema } from "./file-schemas";

@injectable()
export class FileController {
  constructor(
    private readonly createFileUseCase: CreateFileUseCase,
    private readonly listFilesUseCase: ListFilesUseCase,
    private readonly getFileUseCase: GetFileUseCase,
    private readonly downloadFileUseCase: DownloadFileUseCase,
    private readonly updateFileUseCase: UpdateFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    if (!request.file) {
      throw new ValidationError(
        `Envie o arquivo no campo "${FILE_FIELD_NAME}" de um formulário multipart/form-data.`,
      );
    }

    const file = await this.createFileUseCase.execute(
      {
        originalName: request.file.originalname,
        mimeType: request.file.mimetype,
        content: request.file.buffer,
      },
      getTenantContext(request),
    );

    response.status(201).json(file);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listFilesUseCase.execute(
      listQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const file = await this.getFileUseCase.execute(id, getTenantContext(request));

    response.status(200).json(file);
  };

  download: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const { file, content } = await this.downloadFileUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.attachment(file.originalName ?? file.id);
    response.type(file.mimeType);
    response.setHeader("Content-Length", file.size);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.status(200);

    await pipeline(content, response);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const file = await this.updateFileUseCase.execute(
      id,
      updateFileSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(file);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteFileUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
