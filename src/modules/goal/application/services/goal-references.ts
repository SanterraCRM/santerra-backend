import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError, ValidationError } from "../../../../shared/errors/app-error";
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from "../../../employee";

@injectable()
export class GoalReferences {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async ensureActiveEmployee(employeeId: string, companyId: string): Promise<void> {
    const employee = await this.employeeRepository.findById(employeeId, companyId);

    if (!employee) {
      throw new ResourceNotFoundError("Funcionário não encontrado.");
    }

    if (!employee.isActive()) {
      throw new ValidationError("O vendedor precisa ser um funcionário ativo.");
    }
  }
}
