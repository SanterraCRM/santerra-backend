import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  RESELLER_REPOSITORY,
  ResellerRepository,
} from "../../domain/repositories/reseller-repository";

@injectable()
export class DeleteResellerUseCase {
  constructor(
    @inject(RESELLER_REPOSITORY)
    private readonly resellerRepository: ResellerRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const reseller = await this.resellerRepository.findById(id, context.companyId);

    if (!reseller) {
      throw new ResourceNotFoundError("Revendedor não encontrado.");
    }

    reseller.delete(context.userId);
    await this.resellerRepository.delete(reseller);
  }
}
