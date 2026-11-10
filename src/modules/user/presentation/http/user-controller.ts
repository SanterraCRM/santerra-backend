import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getAuthContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateUserUseCase } from "../../application/use-cases/create-user-use-case";
import { DeleteUserUseCase } from "../../application/use-cases/delete-user-use-case";
import { GetUserUseCase } from "../../application/use-cases/get-user-use-case";
import { ListUsersUseCase } from "../../application/use-cases/list-users-use-case";
import { UpdateUserUseCase } from "../../application/use-cases/update-user-use-case";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "./user-schemas";

@injectable()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const user = await this.createUserUseCase.execute(
      createUserSchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(201).json(user);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listUsersUseCase.execute(
      listUsersQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const user = await this.getUserUseCase.execute(id);

    response.status(200).json(user);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const user = await this.updateUserUseCase.execute(
      id,
      updateUserSchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(200).json(user);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteUserUseCase.execute(id, getAuthContext(request));

    response.status(204).send();
  };
}
