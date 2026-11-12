import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface HarvestProps {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateHarvestProps {
  name: string;
  createdById?: string | null;
}

export interface UpdateHarvestProps {
  name?: string;
  updatedById?: string | null;
}

export class Harvest {
  private constructor(private readonly props: HarvestProps) {}

  static create(
    input: CreateHarvestProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Harvest {
    const name = Harvest.normalizeName(input.name);

    return new Harvest({
      id,
      name,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: HarvestProps): Harvest {
    return new Harvest({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdateHarvestProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Harvest.normalizeName(input.name);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): HarvestProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome da cultura é obrigatório.");
    }

    return name.trim();
  }
}
