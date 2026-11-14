import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from "../../../employee";
import { EVENT_REPOSITORY, EventRepository } from "../../../event";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import { PRODUCER_REPOSITORY, ProducerRepository } from "../../../producer";
import { RESELLER_REPOSITORY, ResellerRepository } from "../../../reseller";
import { WALLET_REPOSITORY, WalletRepository } from "../../../wallet";
import { CommercialAction } from "../../domain/entities/commercialAction";
import { UpdateCommercialActionDto } from "../dtos/update-commercialAction-dto";

@injectable()
export class CommercialActionReferences {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
    @inject(RESELLER_REPOSITORY)
    private readonly resellerRepository: ResellerRepository,
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async ensureExist(
    commercialAction: CommercialAction,
    changes: UpdateCommercialActionDto,
    companyId: string,
  ): Promise<void> {
    if (
      changes.eventId !== undefined &&
      !(await this.eventRepository.findById(commercialAction.eventId, companyId))
    ) {
      throw new ResourceNotFoundError("Tipo de evento não encontrado.");
    }

    if (
      changes.walletId !== undefined &&
      !(await this.walletRepository.findById(commercialAction.walletId, companyId))
    ) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    if (
      changes.responsibleId !== undefined &&
      !(await this.employeeRepository.findById(commercialAction.responsibleId, companyId))
    ) {
      throw new ResourceNotFoundError("Funcionário responsável não encontrado.");
    }

    if (changes.producerGuestIds !== undefined) {
      await this.ensureAll(
        commercialAction.producerGuestIds,
        (ids) => this.producerRepository.findManyByIds(ids, companyId),
        "Produtor convidado não encontrado.",
      );
    }

    if (changes.resellerGuestIds !== undefined) {
      await this.ensureAll(
        commercialAction.resellerGuestIds,
        (ids) => this.resellerRepository.findManyByIds(ids, companyId),
        "Revenda convidada não encontrada.",
      );
    }

    if (changes.participantIds !== undefined) {
      await this.ensureAll(
        commercialAction.participantIds,
        (ids) => this.employeeRepository.findManyByIds(ids, companyId),
        "Funcionário participante não encontrado.",
      );
    }

    if (changes.fileIds !== undefined) {
      await this.ensureAll(
        commercialAction.fileIds,
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
