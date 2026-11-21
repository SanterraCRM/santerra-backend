import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PERSON_REPOSITORY, PersonRepository } from "../../../person";
import { EmployeeProps } from "../../domain/entities/employee";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";
import { UpdateEmployeeDto } from "../dtos/update-employee-dto";
import { EmployeeAccessPreparer } from "../services/employee-access-preparer";
import { EmployeeMemberValidator } from "../services/employee-member-validator";

@injectable()
export class UpdateEmployeeUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    private readonly employeeMemberValidator: EmployeeMemberValidator,
    private readonly employeeAccessPreparer: EmployeeAccessPreparer,
  ) {}

  async execute(
    id: string,
    input: UpdateEmployeeDto,
    context: TenantContext,
  ): Promise<EmployeeProps> {
    const employee = await this.employeeRepository.findById(id, context.companyId);

    if (!employee) {
      throw new ResourceNotFoundError("Funcionário não encontrado.");
    }

    const { access: accessInput, ...employeeInput } = input;
    employee.update({ ...employeeInput, updatedById: context.userId });

    if (input.personId !== undefined) {
      if (!(await this.personRepository.findById(employee.personId, context.companyId))) {
        throw new ResourceNotFoundError("Pessoa não encontrada.");
      }

      const owner = await this.employeeRepository.findByPersonId(
        employee.personId,
        context.companyId,
      );

      if (owner && owner.id !== employee.id) {
        throw new ConflictError("Esta pessoa já está cadastrada como funcionário.");
      }
    }

    if (input.userCompanyId && employee.userCompanyId) {
      await this.employeeMemberValidator.ensureAvailable(
        employee.userCompanyId,
        context.companyId,
        employee.id,
      );
    }

    const person = accessInput
      ? await this.personRepository.findById(employee.personId, context.companyId)
      : null;

    if (accessInput && !person) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    const access = person
      ? await this.employeeAccessPreparer.prepare(person.toObject(), input, context)
      : null;

    if (access) {
      employee.update({ userCompanyId: access.member.id, updatedById: context.userId });
    }

    const updatedEmployee = await this.employeeRepository.update(employee, access);

    return updatedEmployee.toObject();
  }
}
