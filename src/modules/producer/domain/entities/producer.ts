import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

const MAX_TOTAL_AREA = 9_999_999_999.99;

export interface ProducerProps {
  id: string;
  personId: string;
  potentialId: string;
  address: string | null;
  mainCrop: string | null;
  totalArea: number | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateProducerProps {
  personId: string;
  potentialId: string;
  address?: string | null;
  mainCrop?: string | null;
  totalArea?: number | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateProducerProps {
  personId?: string;
  potentialId?: string;
  address?: string | null;
  mainCrop?: string | null;
  totalArea?: number | null;
  updatedById?: string | null;
}

export class Producer {
  private constructor(private readonly props: ProducerProps) {}

  static create(
    input: CreateProducerProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Producer {
    const personId = Producer.normalizePersonId(input.personId);
    const potentialId = Producer.normalizePotentialId(input.potentialId);
    const totalArea = Producer.normalizeTotalArea(input.totalArea ?? null);

    return new Producer({
      id,
      personId,
      potentialId,
      address: input.address ?? null,
      mainCrop: input.mainCrop ?? null,
      totalArea,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: ProducerProps): Producer {
    return new Producer({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get personId(): string {
    return this.props.personId;
  }

  get potentialId(): string {
    return this.props.potentialId;
  }

  update(input: UpdateProducerProps, updatedAt = new Date()): void {
    if (input.personId !== undefined) {
      this.props.personId = Producer.normalizePersonId(input.personId);
    }

    if (input.potentialId !== undefined) {
      this.props.potentialId = Producer.normalizePotentialId(input.potentialId);
    }

    if (input.address !== undefined) {
      this.props.address = input.address;
    }

    if (input.mainCrop !== undefined) {
      this.props.mainCrop = input.mainCrop;
    }

    if (input.totalArea !== undefined) {
      this.props.totalArea = Producer.normalizeTotalArea(input.totalArea);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): ProducerProps {
    return { ...this.props };
  }

  private static normalizePersonId(personId?: string): string {
    if (typeof personId !== "string" || personId.trim().length === 0) {
      throw new DomainError("O ID da pessoa é obrigatório.");
    }

    return personId.trim();
  }

  private static normalizePotentialId(potentialId?: string): string {
    if (typeof potentialId !== "string" || potentialId.trim().length === 0) {
      throw new DomainError("O ID do potencial é obrigatório.");
    }

    return potentialId.trim();
  }

  private static normalizeTotalArea(totalArea: number | null): number | null {
    if (totalArea === null) {
      return null;
    }

    if (typeof totalArea !== "number" || !Number.isFinite(totalArea)) {
      throw new DomainError("A área total deve ser um número.");
    }

    if (totalArea <= 0) {
      throw new DomainError("A área total deve ser maior que zero.");
    }

    if (totalArea > MAX_TOTAL_AREA) {
      throw new DomainError("A área total excede o máximo permitido.");
    }

    return totalArea;
  }
}
