import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  RESELLER_VIEW_REPOSITORY,
  ResellerViewRepository,
} from "../../domain/repositories/resellerView-repository";
import { ResellerViewDto, toResellerViewDto } from "../dtos/resellersView-dto";

@injectable()
export class GetResellerViewUseCase {
  constructor(
    @inject(RESELLER_VIEW_REPOSITORY)
    private readonly resellerRepository: ResellerViewRepository,
  ) {}

  async execute(
    id: number,
  ): Promise<ResellerViewDto> {
    const reseller = await this.resellerRepository.findById(
      id,
    );

    if (!reseller) {
      throw new ResourceNotFoundError("Cliente não encontrado.");
    }

    return toResellerViewDto(reseller);
  }
}