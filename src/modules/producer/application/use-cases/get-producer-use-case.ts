import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PRODUCER_REPOSITORY,
  ProducerRepository,
} from "../../domain/repositories/producer-repository";
import { ProducerListItemDto } from "../dtos/producer-list-item-dto";

@injectable()
export class GetProducerUseCase {
  constructor(
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<ProducerListItemDto> {
    const item = await this.producerRepository.findListItemById(id, context.companyId);

    if (!item) {
      throw new ResourceNotFoundError("Produtor não encontrado.");
    }

    return { ...item.producer.toObject(), person: item.person };
  }
}
