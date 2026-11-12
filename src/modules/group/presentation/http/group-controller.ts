import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateGroupUseCase } from "../../application/use-cases/create-group-use-case";
import { DeleteGroupUseCase } from "../../application/use-cases/delete-group-use-case";
import { GetGroupUseCase } from "../../application/use-cases/get-group-use-case";
import { ListGroupsUseCase } from "../../application/use-cases/list-groups-use-case";
import { UpdateGroupUseCase } from "../../application/use-cases/update-group-use-case";
import {
  createGroupSchema,
  listGroupsQuerySchema,
  updateGroupSchema,
} from "./group-schemas";

@injectable()
export class GroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly listGroupsUseCase: ListGroupsUseCase,
    private readonly getGroupUseCase: GetGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const group = await this.createGroupUseCase.execute(
      createGroupSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(group);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listGroupsUseCase.execute(
      listGroupsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const group = await this.getGroupUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(group);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const group = await this.updateGroupUseCase.execute(
      id,
      updateGroupSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(group);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteGroupUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
