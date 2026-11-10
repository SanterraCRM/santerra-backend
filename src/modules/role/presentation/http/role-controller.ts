import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateRoleUseCase } from "../../application/use-cases/create-role-use-case";
import { DeleteRoleUseCase } from "../../application/use-cases/delete-role-use-case";
import { GetRoleUseCase } from "../../application/use-cases/get-role-use-case";
import { ListRolesUseCase } from "../../application/use-cases/list-roles-use-case";
import { UpdateRoleUseCase } from "../../application/use-cases/update-role-use-case";
import { createRoleSchema, listRolesQuerySchema, updateRoleSchema } from "./role-schemas";

@injectable()
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const role = await this.createRoleUseCase.execute(
      createRoleSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(role);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listRolesUseCase.execute(
      listRolesQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const role = await this.getRoleUseCase.execute(id, getTenantContext(request));

    response.status(200).json(role);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const role = await this.updateRoleUseCase.execute(
      id,
      updateRoleSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(role);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteRoleUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
