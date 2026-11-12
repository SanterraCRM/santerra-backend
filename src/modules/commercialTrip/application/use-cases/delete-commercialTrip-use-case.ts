import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMMERCIAL_TRIP_REPOSITORY,
  CommercialTripRepository,
} from "../../domain/repositories/commercialTrip-repository";

@injectable()
export class DeleteCommercialTripUseCase {
  constructor(
    @inject(COMMERCIAL_TRIP_REPOSITORY)
    private readonly commercialTripRepository: CommercialTripRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const commercialTrip = await this.commercialTripRepository.findById(id, context.companyId);

    if (!commercialTrip) {
      throw new ResourceNotFoundError("Visita não encontrada.");
    }

    commercialTrip.delete(context.userId);
    await this.commercialTripRepository.delete(commercialTrip);
  }
}
