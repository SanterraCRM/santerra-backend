import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ForbiddenError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import {
  COMMERCIAL_ACTION_REPOSITORY,
  CommercialActionRepository,
} from "../../domain/repositories/commercialAction-repository";
import {
  CommercialActionDetailsDto,
  toCommercialActionDetailsDto,
} from "../dtos/commercialAction-details-dto";
import { UpdateCommercialActionDto } from "../dtos/update-commercialAction-dto";
import { CommercialActionReferences } from "../services/commercial-action-references";

@injectable()
export class UpdateCommercialActionUseCase {
  constructor(
    @inject(COMMERCIAL_ACTION_REPOSITORY)
    private readonly commercialActionRepository: CommercialActionRepository,
    private readonly commercialActionReferences: CommercialActionReferences,
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateCommercialActionDto,
    context: TenantContext,
  ): Promise<CommercialActionDetailsDto> {
    const commercialAction = await this.commercialActionRepository.findById(id, context.companyId);

    if (!commercialAction) {
      throw new ResourceNotFoundError("Ação comercial não encontrada.");
    }

    const previousCharge = commercialAction.charge;
    const previousFileIds = commercialAction.fileIds;

    commercialAction.update({ ...input, updatedById: context.userId });

    const removedFileIds = previousFileIds.filter(
      (fileId) => !commercialAction.fileIds.includes(fileId),
    );

    if (removedFileIds.length > 0 && !context.permissions.includes(PERMISSIONS.FILES_DELETE)) {
      throw new ForbiddenError("Você não tem permissão para remover anexos.");
    }

    await this.commercialActionReferences.ensureExist(
      commercialAction,
      input,
      context.companyId,
    );

    const updatedCommercialAction = await this.commercialActionRepository.update(
      commercialAction,
      previousCharge,
    );
    await this.fileRepository.deleteUnlinked(removedFileIds, context.companyId, context.userId);

    return toCommercialActionDetailsDto(updatedCommercialAction, context);
  }
}
