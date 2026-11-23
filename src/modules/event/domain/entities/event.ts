import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface EventProps {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateEventProps {
  name: string;
  description?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateEventProps {
  name?: string;
  description?: string | null;
  updatedById?: string | null;
}

export class Event {
  private constructor(private readonly props: EventProps) {}

  static create(
    input: CreateEventProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Event {
    const name = Event.normalizeName(input.name);

    return new Event({
      id,
      name,
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

  static reconstitute(props: EventProps): Event {
    return new Event({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdateEventProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Event.normalizeName(input.name);
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

  toObject(): EventProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do tipo de evento é obrigatório.");
    }

    return name.trim();
  }
}
