import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { describeCommercialUsage } from "../../../../shared/domain/commercial-usage";
import {
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";

@injectable()
export class DeleteEmployeeUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const employee = await this.employeeRepository.findById(id, context.companyId);

    if (!employee) {
      throw new ResourceNotFoundError("Funcionário não encontrado.");
    }

    const usage = describeCommercialUsage(
      await this.employeeRepository.countCommercialUsage(employee.id, context.companyId),
    );

    if (usage) {
      throw new ResourceInUseError(`Este funcionário está em ${usage}.`);
    }

    employee.delete(context.userId);
    await this.employeeRepository.delete(employee);
  }
}
