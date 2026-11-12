import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateEmployeeUseCase } from "../../application/use-cases/create-employee-use-case";
import { DeleteEmployeeUseCase } from "../../application/use-cases/delete-employee-use-case";
import { GetEmployeeUseCase } from "../../application/use-cases/get-employee-use-case";
import { ListEmployeesUseCase } from "../../application/use-cases/list-employees-use-case";
import { UpdateEmployeeUseCase } from "../../application/use-cases/update-employee-use-case";
import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from "./employee-schemas";

@injectable()
export class EmployeeController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly listEmployeesUseCase: ListEmployeesUseCase,
    private readonly getEmployeeUseCase: GetEmployeeUseCase,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly deleteEmployeeUseCase: DeleteEmployeeUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const employee = await this.createEmployeeUseCase.execute(
      createEmployeeSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(employee);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listEmployeesUseCase.execute(
      listEmployeesQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const employee = await this.getEmployeeUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(employee);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const employee = await this.updateEmployeeUseCase.execute(
      id,
      updateEmployeeSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(employee);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteEmployeeUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
