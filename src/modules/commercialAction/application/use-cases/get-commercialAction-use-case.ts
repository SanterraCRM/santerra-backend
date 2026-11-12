import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMMERCIAL_ACTION_REPOSITORY,
  CommercialActionRepository,
} from "../../domain/repositories/commercialAction-repository";
import {
  CommercialActionDetailsDto,
  toCommercialActionDetailsDto,
} from "../dtos/commercialAction-details-dto";

@injectable()
export class GetCommercialActionUseCase {
  constructor(
    @inject(COMMERCIAL_ACTION_REPOSITORY)
    private readonly commercialActionRepository: CommercialActionRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<CommercialActionDetailsDto> {
    const commercialAction = await this.commercialActionRepository.findDetailsById(
      id,
      context.companyId,
    );

    if (!commercialAction) {
      throw new ResourceNotFoundError("Ação comercial não encontrada.");
    }

    return toCommercialActionDetailsDto(commercialAction, context);
  }
}
