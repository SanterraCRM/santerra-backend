import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { CommercialTrip } from "../../domain/entities/commercialTrip";
import {
  COMMERCIAL_TRIP_REPOSITORY,
  CommercialTripRepository,
} from "../../domain/repositories/commercialTrip-repository";
import {
  CommercialTripDetailsDto,
  toCommercialTripDetailsDto,
} from "../dtos/commercialTrip-details-dto";
import { CreateCommercialTripDto } from "../dtos/create-commercialTrip-dto";
import { CommercialTripReferences } from "../services/commercial-trip-references";

@injectable()
export class CreateCommercialTripUseCase {
  constructor(
    @inject(COMMERCIAL_TRIP_REPOSITORY)
    private readonly commercialTripRepository: CommercialTripRepository,
    private readonly commercialTripReferences: CommercialTripReferences,
  ) {}

  async execute(
    input: CreateCommercialTripDto,
    context: TenantContext,
  ): Promise<CommercialTripDetailsDto> {
    const commercialTrip = CommercialTrip.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    await this.commercialTripReferences.ensureExist(commercialTrip, input, context.companyId);

    const createdCommercialTrip = await this.commercialTripRepository.create(commercialTrip);

    return toCommercialTripDetailsDto(createdCommercialTrip, context);
  }
}
