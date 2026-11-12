import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError, ValidationError } from "../../../../shared/errors/app-error";
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from "../../../employee";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import { HARVEST_REPOSITORY, HarvestRepository } from "../../../harvest";
import { PRODUCER_REPOSITORY, ProducerRepository } from "../../../producer";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../../product";
import { CommercialTrip } from "../../domain/entities/commercialTrip";
import { UpdateCommercialTripDto } from "../dtos/update-commercialTrip-dto";

@injectable()
export class CommercialTripReferences {
  constructor(
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
    @inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async ensureExist(
    commercialTrip: CommercialTrip,
    changes: UpdateCommercialTripDto,
    companyId: string,
  ): Promise<void> {
    if (
      changes.producerId !== undefined &&
      !(await this.producerRepository.findById(commercialTrip.producerId, companyId))
    ) {
      throw new ResourceNotFoundError("Produtor não encontrado.");
    }

    if (changes.responsibleId !== undefined) {
      const responsible = await this.employeeRepository.findById(
        commercialTrip.responsibleId,
        companyId,
      );

      if (!responsible) {
        throw new ResourceNotFoundError("Funcionário responsável não encontrado.");
      }

      if (!responsible.isActive()) {
        throw new ValidationError("O responsável precisa ser um funcionário ativo.");
      }
    }

    if (changes.participantIds !== undefined) {
      await this.ensureAll(
        commercialTrip.participantIds,
        (ids) => this.employeeRepository.findManyByIds(ids, companyId),
        "Funcionário participante não encontrado.",
      );
    }

    if (changes.harvestIds !== undefined) {
      await this.ensureAll(
        commercialTrip.harvestIds,
        (ids) => this.harvestRepository.findManyByIds(ids),
        "Cultura não encontrada.",
      );
    }

    if (changes.recommendedProductIds !== undefined) {
      await this.ensureAll(
        commercialTrip.recommendedProductIds,
        (ids) => this.productRepository.findManyByIds(ids, companyId),
        "Produto recomendado não encontrado.",
      );
    }

    if (changes.fileIds !== undefined) {
      await this.ensureAll(
        commercialTrip.fileIds,
        (ids) => this.fileRepository.findManyByIds(ids, companyId),
        "Arquivo não encontrado.",
      );
    }
  }

  private async ensureAll(
    ids: string[],
    findManyByIds: (ids: string[]) => Promise<unknown[]>,
    message: string,
  ): Promise<void> {
    if (ids.length > 0 && (await findManyByIds(ids)).length !== ids.length) {
      throw new ResourceNotFoundError(message);
    }
  }
}
