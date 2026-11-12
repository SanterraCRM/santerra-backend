import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "../../domain/repositories/person-repository";
import { ListPersonsDto } from "../dtos/list-persons-dto";
import { PersonDetailsDto, toPersonDetailsDto } from "../dtos/person-details-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListPersonsUseCase {
  constructor(
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(
    input: ListPersonsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<PersonDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.personRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      type: input.type,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      missing: input.missing,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.persons.map((person) => toPersonDetailsDto(person, context.permissions)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
