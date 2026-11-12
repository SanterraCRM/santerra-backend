import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { Reseller } from "../../domain/entities/reseller";
import {
  RESELLER_REPOSITORY,
  ResellerRepository,
} from "../../domain/repositories/reseller-repository";
import { CreateResellerDto } from "../dtos/create-reseller-dto";
import { ResellerDetailsDto, toResellerDetailsDto } from "../dtos/reseller-details-dto";

@injectable()
export class CreateResellerUseCase {
  constructor(
    @inject(RESELLER_REPOSITORY)
    private readonly resellerRepository: ResellerRepository,
  ) {}

  async execute(
    input: CreateResellerDto,
    context: TenantContext,
  ): Promise<ResellerDetailsDto> {
    const reseller = Reseller.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (
      reseller.registrationNumber &&
      (await this.resellerRepository.findByRegistrationNumber(
        reseller.registrationNumber,
        context.companyId,
      ))
    ) {
      throw new ConflictError("Já existe um revendedor com este documento.");
    }

    const createdReseller = await this.resellerRepository.create(reseller);

    return toResellerDetailsDto(createdReseller);
  }
}
