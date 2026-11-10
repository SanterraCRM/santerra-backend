import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";
import { CommercialTripStatus } from "../../enumCommercialTrip/EnumCommercialTrip";

export interface CommercialTripProps {
  id: string;
  performedActionDescription: string | null;
  followUpDetails: string | null;
  pendingIssuesDescription: string | null;
  status: CommercialTripStatus,
  tripDate: Date | null,
  expectedDate: Date | null,
  producerId: string,
  responsibleId: string,
  companyId: string
  participantIds: string[];
  harvestIds: string[];
  recommendedProductIds: string[];
  fileIds: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateCommercialTripProps {
  performedActionDescription?: string | null;
  followUpDetails?: string | null;
  pendingIssuesDescription?: string | null;
  status: CommercialTripStatus,
  tripDate?: Date | null,
  expectedDate?: Date | null,
  producerId: string,
  responsibleId: string,
  companyId: string
  participantIds?: string[];
  harvestIds?: string[];
  recommendedProductIds?: string[];
  fileIds?: string[];
  createdById?: string | null;
}

export interface UpdateCommercialTripProps {
  performedActionDescription?: string | null;
  followUpDetails?: string | null;
  pendingIssuesDescription?: string | null;
  status?: CommercialTripStatus,
  tripDate?: Date | null,
  expectedDate?: Date | null,
  producerId?: string,
  responsibleId?: string,
  participantIds?: string[];
  harvestIds?: string[];
  recommendedProductIds?: string[];
  fileIds?: string[];
  updatedById?: string | null;
}

export class CommercialTrip {
  private constructor(private readonly props: CommercialTripProps) {}

  static create(
    input: CreateCommercialTripProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): CommercialTrip {
    const producerId = CommercialTrip.normalizeProducerId(input.producerId);
    const responsibleId = CommercialTrip.normalizeResponsibleId(input.responsibleId);

    const commercialTrip = new CommercialTrip({
      id,
      performedActionDescription: input.performedActionDescription ?? null,
      followUpDetails: input.followUpDetails ?? null,
      pendingIssuesDescription: input.pendingIssuesDescription ?? null,
      status: input.status,
      tripDate: input.tripDate ?? null,
      expectedDate: input.expectedDate ?? null,
      producerId,
      responsibleId,
      companyId: input.companyId,
      participantIds: CommercialTrip.normalizeIds(input.participantIds ?? []),
      harvestIds: CommercialTrip.normalizeIds(input.harvestIds ?? []),
      recommendedProductIds: CommercialTrip.normalizeIds(input.recommendedProductIds ?? []),
      fileIds: CommercialTrip.normalizeIds(input.fileIds ?? []),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });

    commercialTrip.ensureConsistency();

    return commercialTrip;
  }

  static reconstitute(props: CommercialTripProps): CommercialTrip {
    return new CommercialTrip({
      ...props,
      participantIds: [...props.participantIds],
      harvestIds: [...props.harvestIds],
      recommendedProductIds: [...props.recommendedProductIds],
      fileIds: [...props.fileIds],
    });
  }

  get producerId(): string {
    return this.props.producerId;
  }

  get responsibleId(): string {
    return this.props.responsibleId;
  }

  get participantIds(): string[] {
    return [...this.props.participantIds];
  }

  get harvestIds(): string[] {
    return [...this.props.harvestIds];
  }

  get recommendedProductIds(): string[] {
    return [...this.props.recommendedProductIds];
  }

  get fileIds(): string[] {
    return [...this.props.fileIds];
  }

  update(input: UpdateCommercialTripProps, updatedAt = new Date()): void {
    
    if (input.performedActionDescription !== undefined) {
      this.props.performedActionDescription = input.performedActionDescription;
    }

    if (input.followUpDetails !== undefined) {
      this.props.followUpDetails = input.followUpDetails;
    }

    if (input.pendingIssuesDescription !== undefined) {
      this.props.pendingIssuesDescription = input.pendingIssuesDescription;
    }

    if (input.status !== undefined) {
      this.props.status = input.status;
    }

    if (input.tripDate !== undefined) {
      this.props.tripDate = input.tripDate;
    }

    if (input.expectedDate !== undefined) {
      this.props.expectedDate = input.expectedDate;
    }

    if (input.producerId !== undefined) {
      this.props.producerId = CommercialTrip.normalizeProducerId(input.producerId);
    }

    if (input.responsibleId !== undefined) {
      this.props.responsibleId = CommercialTrip.normalizeResponsibleId(input.responsibleId);
    }

    if (input.participantIds !== undefined) {
      this.props.participantIds = CommercialTrip.normalizeIds(input.participantIds);
    }

    if (input.harvestIds !== undefined) {
      this.props.harvestIds = CommercialTrip.normalizeIds(input.harvestIds);
    }

    if (input.recommendedProductIds !== undefined) {
      this.props.recommendedProductIds = CommercialTrip.normalizeIds(input.recommendedProductIds);
    }

    if (input.fileIds !== undefined) {
      this.props.fileIds = CommercialTrip.normalizeIds(input.fileIds);
    }

    this.ensureConsistency();
    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  private ensureConsistency(): void {
    if (this.props.status === CommercialTripStatus.COMPLETED && this.props.tripDate === null) {
      throw new DomainError("Informe a data realizada para finalizar a visita.");
    }

    if (this.props.participantIds.includes(this.props.responsibleId)) {
      throw new DomainError("O responsável não pode estar entre os participantes.");
    }
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): CommercialTripProps {
    return {
      ...this.props,
      participantIds: [...this.props.participantIds],
      harvestIds: [...this.props.harvestIds],
      recommendedProductIds: [...this.props.recommendedProductIds],
      fileIds: [...this.props.fileIds],
    };
  }

  private static normalizeIds(ids: string[]): string[] {
    return [...new Set(ids)];
  }

  private static normalizeProducerId(producerId: string): string {
    if (typeof producerId !== "string" || producerId.trim().length === 0) {
      throw new DomainError("O ID do produtor é obrigatório.");
    }

    return producerId.trim();
  }

  private static normalizeResponsibleId(responsibleId: string): string {
    if (typeof responsibleId !== "string" || responsibleId.trim().length === 0) {
      throw new DomainError("O ID do responsável é obrigatório.");
    }

    return responsibleId.trim();
  }
}
