import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "../../domain/repositories/person-repository";
import { PersonDetailsDto, toPersonDetailsDto } from "../dtos/person-details-dto";
import { UpdatePersonDto } from "../dtos/update-person-dto";

@injectable()
export class UpdatePersonUseCase {
  constructor(
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(
    id: string,
    input: UpdatePersonDto,
    context: TenantContext,
  ): Promise<PersonDetailsDto> {
    const person = await this.personRepository.findById(id, context.companyId);

    if (!person) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    if (input.nationalId) {
      const owner = await this.personRepository.findByNationalId(
        input.nationalId,
        context.companyId,
      );

      if (owner && owner.id !== person.id) {
        throw new ConflictError("Já existe uma pessoa com este documento.");
      }
    }

    person.update({ ...input, updatedById: context.userId });
    const updatedPerson = await this.personRepository.update(person);

    return toPersonDetailsDto(updatedPerson, context.permissions);
  }
}
