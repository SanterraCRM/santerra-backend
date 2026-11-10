import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { CommercialAction } from "../../domain/entities/commercialAction";
import {
  COMMERCIAL_ACTION_REPOSITORY,
  CommercialActionRepository,
} from "../../domain/repositories/commercialAction-repository";
import {
  CommercialActionDetailsDto,
  toCommercialActionDetailsDto,
} from "../dtos/commercialAction-details-dto";
import { CreateCommercialActionDto } from "../dtos/create-commercialAction-dto";
import { CommercialActionReferences } from "../services/commercial-action-references";

@injectable()
export class CreateCommercialActionUseCase {
  constructor(
    @inject(COMMERCIAL_ACTION_REPOSITORY)
    private readonly commercialActionRepository: CommercialActionRepository,
    private readonly commercialActionReferences: CommercialActionReferences,
  ) {}

  async execute(
    input: CreateCommercialActionDto,
    context: TenantContext,
  ): Promise<CommercialActionDetailsDto> {
    const commercialAction = CommercialAction.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    await this.commercialActionReferences.ensureExist(
      commercialAction,
      input,
      context.companyId,
    );

    const createdCommercialAction = await this.commercialActionRepository.create(commercialAction);

    return toCommercialActionDetailsDto(createdCommercialAction, context);
  }
}
