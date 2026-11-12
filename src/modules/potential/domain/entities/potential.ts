import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface PotentialProps {
  id: string;
  name: string;
  numericValue: number | null;
  description: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreatePotentialProps {
  name: string;
  numericValue?: number | null;
  description?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdatePotentialProps {
  name?: string;
  numericValue?: number | null;
  description?: string | null;
  updatedById?: string | null;
}

export class Potential {
  private constructor(private readonly props: PotentialProps) {}

  static create(
    input: CreatePotentialProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Potential {
    const name = Potential.normalizeName(input.name);

    return new Potential({
      id,
      name,
      numericValue: input.numericValue ?? null,
      description: input.description ?? null,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: PotentialProps): Potential {
    return new Potential({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdatePotentialProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Potential.normalizeName(input.name);
    }

    if (input.numericValue !== undefined) {
      this.props.numericValue = input.numericValue;
    }

    if (input.description !== undefined) {
      this.props.description = input.description;
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): PotentialProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do potencial é obrigatório.");
    }

    return name.trim();
  }

}
