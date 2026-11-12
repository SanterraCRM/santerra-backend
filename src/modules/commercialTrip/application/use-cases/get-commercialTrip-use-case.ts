import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMMERCIAL_TRIP_REPOSITORY,
  CommercialTripRepository,
} from "../../domain/repositories/commercialTrip-repository";
import {
  CommercialTripDetailsDto,
  toCommercialTripDetailsDto,
} from "../dtos/commercialTrip-details-dto";

@injectable()
export class GetCommercialTripUseCase {
  constructor(
    @inject(COMMERCIAL_TRIP_REPOSITORY)
    private readonly commercialTripRepository: CommercialTripRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<CommercialTripDetailsDto> {
    const commercialTrip = await this.commercialTripRepository.findDetailsById(
      id,
      context.companyId,
    );

    if (!commercialTrip) {
      throw new ResourceNotFoundError("Visita não encontrada.");
    }

    return toCommercialTripDetailsDto(commercialTrip, context);
  }
}
