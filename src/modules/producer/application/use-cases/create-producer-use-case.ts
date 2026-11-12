import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PERSON_REPOSITORY, PersonRepository } from "../../../person";
import { POTENTIAL_REPOSITORY, PotentialRepository } from "../../../potential";
import { Producer, ProducerProps } from "../../domain/entities/producer";
import {
  PRODUCER_REPOSITORY,
  ProducerRepository,
} from "../../domain/repositories/producer-repository";
import { CreateProducerDto } from "../dtos/create-producer-dto";

@injectable()
export class CreateProducerUseCase {
  constructor(
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
    @inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(
    input: CreateProducerDto,
    context: TenantContext,
  ): Promise<ProducerProps> {
    const producer = Producer.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (!(await this.personRepository.findById(producer.personId, context.companyId))) {
      throw new ResourceNotFoundError("Pessoa não encontrada.");
    }

    if (await this.producerRepository.findByPersonId(producer.personId, context.companyId)) {
      throw new ConflictError("Esta pessoa já está cadastrada como produtor.");
    }

    if (!(await this.potentialRepository.findById(producer.potentialId, context.companyId))) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    const createdProducer = await this.producerRepository.create(producer);

    return createdProducer.toObject();
  }
}
