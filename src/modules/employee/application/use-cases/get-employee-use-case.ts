import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";
import { EmployeeListItemDto } from "../dtos/employee-list-item-dto";

@injectable()
export class GetEmployeeUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<EmployeeListItemDto> {
    const item = await this.employeeRepository.findListItemById(id, context.companyId);

    if (!item) {
      throw new ResourceNotFoundError("Funcionário não encontrado.");
    }

    return { ...item.employee.toObject(), person: item.person };
  }
}
