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
import { EmployeeAccessPreparer } from "../services/employee-access-preparer";
import { EmployeeMemberValidator } from "../services/employee-member-validator";

@injectable()
export class CreateEmployeeUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    private readonly employeeMemberValidator: EmployeeMemberValidator,
    private readonly employeeAccessPreparer: EmployeeAccessPreparer,
  ) {}

  async execute(
    input: CreateEmployeeDto,
    context: TenantContext,
  ): Promise<EmployeeProps> {
    const { access: _access, ...employeeInput } = input;
    const person = await this.personRepository.findById(input.personId, context.companyId);

    if (!person) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    if (await this.employeeRepository.findByPersonId(person.id, context.companyId)) {
      throw new ConflictError("Esta pessoa já está cadastrada como funcionário.");
    }

    if (employeeInput.userCompanyId) {
      await this.employeeMemberValidator.ensureAvailable(
        employeeInput.userCompanyId,
        context.companyId,
      );
    }

    const access = await this.employeeAccessPreparer.prepare(person.toObject(), input, context);
    const employee = Employee.create({
      ...employeeInput,
      userCompanyId: access?.member.id ?? employeeInput.userCompanyId,
      companyId: context.companyId,
      createdById: context.userId,
    });
    const createdEmployee = await this.employeeRepository.create(employee, access);

    return createdEmployee.toObject();
  }
}
