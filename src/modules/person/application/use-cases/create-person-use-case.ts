import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import {
  ConflictError,
  ForbiddenError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { EmployeeAccessPreparer } from "../../../employee/application/services/employee-access-preparer";
import { EmployeeMemberValidator } from "../../../employee/application/services/employee-member-validator";
import { Employee } from "../../../employee/domain/entities/employee";
import type { MemberAccess } from "../../../member";
import { POTENTIAL_REPOSITORY, PotentialRepository } from "../../../potential";
import { Producer } from "../../../producer/domain/entities/producer";
import { Person } from "../../domain/entities/person";
import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "../../domain/repositories/person-repository";
import { CreatePersonDto } from "../dtos/create-person-dto";
import { PersonDetailsDto, toPersonDetailsDto } from "../dtos/person-details-dto";

@injectable()
export class CreatePersonUseCase {
  constructor(
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
    private readonly employeeMemberValidator: EmployeeMemberValidator,
    private readonly employeeAccessPreparer: EmployeeAccessPreparer,
  ) {}

  async execute(
    input: CreatePersonDto,
    context: TenantContext,
  ): Promise<PersonDetailsDto> {
    const { employee: employeeInput, producer: producerInput, ...personInput } = input;

    if (employeeInput && !context.permissions.includes(PERMISSIONS.EMPLOYEES_CREATE)) {
      throw new ForbiddenError("Você não tem permissão para cadastrar funcionários.");
    }

    if (producerInput && !context.permissions.includes(PERMISSIONS.PRODUCERS_CREATE)) {
      throw new ForbiddenError("Você não tem permissão para cadastrar produtores.");
    }

    if (
      personInput.nationalId &&
      (await this.personRepository.findByNationalId(
        personInput.nationalId,
        context.companyId,
      ))
    ) {
      throw new ConflictError("Já existe uma pessoa com este documento.");
    }

    const person = Person.create({
      ...personInput,
      companyId: context.companyId,
      createdById: context.userId,
    });
    const link = {
      personId: person.id,
      companyId: context.companyId,
      createdById: context.userId,
    };
    const producer = producerInput && Producer.create({ ...producerInput, ...link });

    if (employeeInput?.userCompanyId) {
      await this.employeeMemberValidator.ensureAvailable(
        employeeInput.userCompanyId,
        context.companyId,
      );
    }

    if (
      producer &&
      !(await this.potentialRepository.findById(producer.potentialId, context.companyId))
    ) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    const memberAccess = employeeInput
      ? await this.employeeAccessPreparer.prepare(person.toObject(), employeeInput, context)
      : null;
    const employee = employeeInput && this.createEmployee(employeeInput, memberAccess, link);
    const createdPerson = await this.personRepository.create(person, {
      employee,
      producer,
      memberAccess,
    });

    return toPersonDetailsDto(createdPerson, context.permissions);
  }

  private createEmployee(
    { access: _access, ...employeeInput }: NonNullable<CreatePersonDto["employee"]>,
    memberAccess: MemberAccess | null,
    link: { personId: string; companyId: string; createdById: string },
  ): Employee {
    return Employee.create({
      ...employeeInput,
      ...link,
      userCompanyId: memberAccess?.member.id ?? employeeInput.userCompanyId,
    });
  }
}
