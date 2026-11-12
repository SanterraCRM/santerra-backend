import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { describeCommercialUsage } from "../../../../shared/domain/commercial-usage";
import {
  ForbiddenError,
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "../../domain/repositories/person-repository";

@injectable()
export class DeletePersonUseCase {
  constructor(
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const details = await this.personRepository.findDetailsById(id, context.companyId);

    if (!details) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    if (details.employee && !context.permissions.includes(PERMISSIONS.EMPLOYEES_DELETE)) {
      throw new ForbiddenError("Você não tem permissão para excluir funcionários.");
    }

    if (details.producer && !context.permissions.includes(PERMISSIONS.PRODUCERS_DELETE)) {
      throw new ForbiddenError("Você não tem permissão para excluir produtores.");
    }

    const usage = describeCommercialUsage(
      await this.personRepository.countCommercialUsage(id, context.companyId),
    );

    if (usage) {
      throw new ResourceInUseError(`Esta pessoa está em ${usage}.`);
    }

    details.person.delete(context.userId);
    await this.personRepository.delete(details.person);
  }
}
