import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

const MAX_PRICE = 999_999_999_999.99;

export interface CommercialActionProps {
  id: string;
  description: string | null;
  eventId: string;
  price: number | null;
  initialDate: Date | null;
  finalDate: Date | null;
  walletId: string;
  responsibleId: string;
  companyId: string;
  invoiceNumber: string | null;
  producerGuestIds: string[];
  resellerGuestIds: string[];
  participantIds: string[];
  fileIds: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

export interface WalletCharge {
  walletId: string;
  amount: number;
}

interface CreateCommercialActionProps {
  description?: string | null;
  eventId: string;
  price?: number | null;
  initialDate?: Date | null;
  finalDate?: Date | null;
  walletId: string;
  responsibleId: string;
  companyId: string;
  invoiceNumber?: string | null;
  producerGuestIds?: string[];
  resellerGuestIds?: string[];
  participantIds?: string[];
  fileIds?: string[];
  createdById?: string | null;
}

export interface UpdateCommercialActionProps {
  description?: string | null;
  eventId?: string;
  price?: number | null;
  initialDate?: Date | null;
  finalDate?: Date | null;
  walletId?: string;
  responsibleId?: string;
  invoiceNumber?: string | null;
  producerGuestIds?: string[];
  resellerGuestIds?: string[];
  participantIds?: string[];
  fileIds?: string[];
  updatedById?: string | null;
}

export class CommercialAction {
  private constructor(private readonly props: CommercialActionProps) {}

  static create(
    input: CreateCommercialActionProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): CommercialAction {
    const eventId = CommercialAction.normalizeEventId(input.eventId);
    const walletId = CommercialAction.normalizeWalletId(input.walletId);
    const responsibleId = CommercialAction.normalizeResponsibleId(input.responsibleId);
    const initialDate = input.initialDate ?? null;
    const finalDate = input.finalDate ?? null;

    CommercialAction.ensureDateRange(initialDate, finalDate);

    return new CommercialAction({
      id,
      description: input.description ?? null,
      eventId,
      price: CommercialAction.normalizePrice(input.price ?? null),
      initialDate,
      finalDate,
      walletId,
      responsibleId,
      companyId: input.companyId,
      invoiceNumber: input.invoiceNumber ?? null,
      producerGuestIds: CommercialAction.normalizeIds(input.producerGuestIds ?? []),
      resellerGuestIds: CommercialAction.normalizeIds(input.resellerGuestIds ?? []),
      participantIds: CommercialAction.normalizeIds(input.participantIds ?? []),
      fileIds: CommercialAction.normalizeIds(input.fileIds ?? []),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: CommercialActionProps): CommercialAction {
    return new CommercialAction({
      ...props,
      producerGuestIds: [...props.producerGuestIds],
      resellerGuestIds: [...props.resellerGuestIds],
      participantIds: [...props.participantIds],
      fileIds: [...props.fileIds],
    });
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get walletId(): string {
    return this.props.walletId;
  }

  get responsibleId(): string {
    return this.props.responsibleId;
  }

  get producerGuestIds(): string[] {
    return [...this.props.producerGuestIds];
  }

  get resellerGuestIds(): string[] {
    return [...this.props.resellerGuestIds];
  }

  get participantIds(): string[] {
    return [...this.props.participantIds];
  }

  get fileIds(): string[] {
    return [...this.props.fileIds];
  }

  get charge(): WalletCharge {
    return {
      walletId: this.props.walletId,
      amount: this.props.price ?? 0,
    };
  }

  update(input: UpdateCommercialActionProps, updatedAt = new Date()): void {
    if (input.description !== undefined) {
      this.props.description = input.description ?? null;
    }

    if (input.eventId !== undefined) {
      this.props.eventId = CommercialAction.normalizeEventId(input.eventId);
    }

    if (input.price !== undefined) {
      this.props.price = CommercialAction.normalizePrice(input.price);
    }

    if (input.initialDate !== undefined) {
      this.props.initialDate = input.initialDate ?? null;
    }

    if (input.finalDate !== undefined) {
      this.props.finalDate = input.finalDate ?? null;
    }

    CommercialAction.ensureDateRange(this.props.initialDate, this.props.finalDate);

    if (input.walletId !== undefined) {
      this.props.walletId = CommercialAction.normalizeWalletId(input.walletId);
    }

    if (input.responsibleId !== undefined) {
      this.props.responsibleId = CommercialAction.normalizeResponsibleId(input.responsibleId);
    }

    if (input.invoiceNumber !== undefined) {
      this.props.invoiceNumber = input.invoiceNumber ?? null;
    }

    if (input.producerGuestIds !== undefined) {
      this.props.producerGuestIds = CommercialAction.normalizeIds(input.producerGuestIds);
    }

    if (input.resellerGuestIds !== undefined) {
      this.props.resellerGuestIds = CommercialAction.normalizeIds(input.resellerGuestIds);
    }

    if (input.participantIds !== undefined) {
      this.props.participantIds = CommercialAction.normalizeIds(input.participantIds);
    }

    if (input.fileIds !== undefined) {
      this.props.fileIds = CommercialAction.normalizeIds(input.fileIds);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): CommercialActionProps {
    return {
      ...this.props,
      producerGuestIds: [...this.props.producerGuestIds],
      resellerGuestIds: [...this.props.resellerGuestIds],
      participantIds: [...this.props.participantIds],
      fileIds: [...this.props.fileIds],
    };
  }

  private static normalizeEventId(eventId: string): string {
    if (typeof eventId !== "string" || eventId.trim().length === 0) {
      throw new DomainError("O ID do evento é obrigatório.");
    }

    return eventId.trim();
  }

  private static normalizeWalletId(walletId: string): string {
    if (typeof walletId !== "string" || walletId.trim().length === 0) {
      throw new DomainError("O ID da carteira é obrigatório.");
    }

    return walletId.trim();
  }

  private static normalizeResponsibleId(responsibleId: string): string {
    if (typeof responsibleId !== "string" || responsibleId.trim().length === 0) {
      throw new DomainError("O ID do responsável é obrigatório.");
    }

    return responsibleId.trim();
  }

  private static normalizePrice(price: number | null): number | null {
    if (price === null) {
      return null;
    }

    if (typeof price !== "number" || !Number.isFinite(price)) {
      throw new DomainError("O valor da ação comercial deve ser um número.");
    }

    if (price < 0) {
      throw new DomainError("O valor da ação comercial não pode ser negativo.");
    }

    if (price > MAX_PRICE) {
      throw new DomainError("O valor da ação comercial excede o máximo permitido.");
    }

    return price;
  }

  private static normalizeIds(ids: string[]): string[] {
    return [...new Set(ids)];
  }

  private static ensureDateRange(initialDate: Date | null, finalDate: Date | null): void {
    if (initialDate && finalDate && finalDate < initialDate) {
      throw new DomainError("A data final não pode ser anterior à data inicial.");
    }
  }
}
