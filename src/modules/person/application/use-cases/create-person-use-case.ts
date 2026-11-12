import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import {
  ConflictError,
  ForbiddenError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { EmployeeMemberValidator } from "../../../employee/application/services/employee-member-validator";
import { Employee } from "../../../employee/domain/entities/employee";
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
    const employee = employeeInput && Employee.create({ ...employeeInput, ...link });
    const producer = producerInput && Producer.create({ ...producerInput, ...link });

    if (employee?.userCompanyId) {
      await this.employeeMemberValidator.ensureAvailable(
        employee.userCompanyId,
        context.companyId,
      );
    }

    if (
      producer &&
      !(await this.potentialRepository.findById(producer.potentialId, context.companyId))
    ) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    const createdPerson = await this.personRepository.create(person, { employee, producer });

    return toPersonDetailsDto(createdPerson, context.permissions);
  }
}
