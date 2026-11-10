import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  RESELLER_REPOSITORY,
  ResellerRepository,
} from "../../domain/repositories/reseller-repository";
import { ResellerDetailsDto, toResellerDetailsDto } from "../dtos/reseller-details-dto";

@injectable()
export class GetResellerUseCase {
  constructor(
    @inject(RESELLER_REPOSITORY)
    private readonly resellerRepository: ResellerRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<ResellerDetailsDto> {
    const reseller = await this.resellerRepository.findDetailsById(id, context.companyId);

    if (!reseller) {
      throw new ResourceNotFoundError("Revendedor não encontrado.");
    }

    return toResellerDetailsDto(reseller);
  }
}
