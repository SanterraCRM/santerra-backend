import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ForbiddenError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import {
  COMMERCIAL_TRIP_REPOSITORY,
  CommercialTripRepository,
} from "../../domain/repositories/commercialTrip-repository";
import {
  CommercialTripDetailsDto,
  toCommercialTripDetailsDto,
} from "../dtos/commercialTrip-details-dto";
import { UpdateCommercialTripDto } from "../dtos/update-commercialTrip-dto";
import { CommercialTripReferences } from "../services/commercial-trip-references";

@injectable()
export class UpdateCommercialTripUseCase {
  constructor(
    @inject(COMMERCIAL_TRIP_REPOSITORY)
    private readonly commercialTripRepository: CommercialTripRepository,
    private readonly commercialTripReferences: CommercialTripReferences,
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateCommercialTripDto,
    context: TenantContext,
  ): Promise<CommercialTripDetailsDto> {
    const commercialTrip = await this.commercialTripRepository.findById(id, context.companyId);

    if (!commercialTrip) {
      throw new ResourceNotFoundError("Visita não encontrada.");
    }

    const previousFileIds = commercialTrip.fileIds;
    commercialTrip.update({ ...input, updatedById: context.userId });
    const removedFileIds = previousFileIds.filter(
      (fileId) => !commercialTrip.fileIds.includes(fileId),
    );

    if (removedFileIds.length > 0 && !context.permissions.includes(PERMISSIONS.FILES_DELETE)) {
      throw new ForbiddenError("Você não tem permissão para remover anexos.");
    }

    await this.commercialTripReferences.ensureExist(commercialTrip, input, context.companyId);

    const updatedCommercialTrip = await this.commercialTripRepository.update(commercialTrip);
    await this.fileRepository.deleteUnlinked(removedFileIds, context.companyId, context.userId);

    return toCommercialTripDetailsDto(updatedCommercialTrip, context);
  }
}
