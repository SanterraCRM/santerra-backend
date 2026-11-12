import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PERSON_REPOSITORY, PersonRepository } from "../../../person";
import { POTENTIAL_REPOSITORY, PotentialRepository } from "../../../potential";
import { ProducerProps } from "../../domain/entities/producer";
import {
  PRODUCER_REPOSITORY,
  ProducerRepository,
} from "../../domain/repositories/producer-repository";
import { UpdateProducerDto } from "../dtos/update-producer-dto";

@injectable()
export class UpdateProducerUseCase {
  constructor(
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateProducerDto,
    context: TenantContext,
  ): Promise<ProducerProps> {
    const producer = await this.producerRepository.findById(id, context.companyId);

    if (!producer) {
      throw new ResourceNotFoundError("Produtor não encontrado.");
    }

    producer.update({ ...input, updatedById: context.userId });

    if (input.personId !== undefined) {
      if (!(await this.personRepository.findById(producer.personId, context.companyId))) {
        throw new ResourceNotFoundError("Pessoa não encontrada.");
      }

      const owner = await this.producerRepository.findByPersonId(
        producer.personId,
        context.companyId,
      );

      if (owner && owner.id !== producer.id) {
        throw new ConflictError("Esta pessoa já está cadastrada como produtor.");
      }
    }

    if (
      input.potentialId !== undefined &&
      !(await this.potentialRepository.findById(producer.potentialId, context.companyId))
    ) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    const updatedProducer = await this.producerRepository.update(producer);

    return updatedProducer.toObject();
  }
}
