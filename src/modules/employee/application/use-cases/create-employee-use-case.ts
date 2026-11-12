import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PERSON_REPOSITORY, PersonRepository } from "../../../person";
import { Employee, EmployeeProps } from "../../domain/entities/employee";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";
import { CreateEmployeeDto } from "../dtos/create-employee-dto";
import { EmployeeMemberValidator } from "../services/employee-member-validator";

@injectable()
export class CreateEmployeeUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    private readonly employeeMemberValidator: EmployeeMemberValidator,
  ) {}

  async execute(
    input: CreateEmployeeDto,
    context: TenantContext,
  ): Promise<EmployeeProps> {
    const employee = Employee.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (!(await this.personRepository.findById(employee.personId, context.companyId))) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    if (await this.employeeRepository.findByPersonId(employee.personId, context.companyId)) {
      throw new ConflictError("Esta pessoa já está cadastrada como funcionário.");
    }

    if (employee.userCompanyId) {
      await this.employeeMemberValidator.ensureAvailable(
        employee.userCompanyId,
        context.companyId,
      );
    }

    const createdEmployee = await this.employeeRepository.create(employee);

    return createdEmployee.toObject();
  }
}
