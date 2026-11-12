import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { idParamSchema, listQuerySchema } from "../../../../shared/http/request-schemas";
import { CreatePermissionUseCase } from "../../application/use-cases/create-permission-use-case";
import { DeletePermissionUseCase } from "../../application/use-cases/delete-permission-use-case";
import { GetPermissionUseCase } from "../../application/use-cases/get-permission-use-case";
import { ListPermissionsUseCase } from "../../application/use-cases/list-permissions-use-case";
import { UpdatePermissionUseCase } from "../../application/use-cases/update-permission-use-case";
import { createPermissionSchema, updatePermissionSchema } from "./permission-schemas";

@injectable()
export class PermissionController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const permission = await this.createPermissionUseCase.execute(
      createPermissionSchema.parse(request.body),
    );

    response.status(201).json(permission);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listPermissionsUseCase.execute(
      listQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const permission = await this.getPermissionUseCase.execute(id);

    response.status(200).json(permission);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const permission = await this.updatePermissionUseCase.execute(
      id,
      updatePermissionSchema.parse(request.body),
    );

    response.status(200).json(permission);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deletePermissionUseCase.execute(id);

    response.status(204).send();
  };
}
