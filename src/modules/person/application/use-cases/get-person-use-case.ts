import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "../../domain/repositories/person-repository";
import { PersonDetailsDto, toPersonDetailsDto } from "../dtos/person-details-dto";

@injectable()
export class GetPersonUseCase {
  constructor(
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<PersonDetailsDto> {
    const person = await this.personRepository.findDetailsById(id, context.companyId);

    if (!person) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    return toPersonDetailsDto(person, context.permissions);
  }
}
