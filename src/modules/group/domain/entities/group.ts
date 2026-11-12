import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface GroupProps {
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

interface CreateGroupProps {
  name: string;
  description?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateGroupProps {
  name?: string;
  description?: string | null;
  updatedById?: string | null;
}

export class Group {
  private constructor(private readonly props: GroupProps) {}

  static create(
    input: CreateGroupProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Group {
    const name = Group.normalizeName(input.name);

    return new Group({
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

  static reconstitute(props: GroupProps): Group {
    return new Group({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdateGroupProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Group.normalizeName(input.name);
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

  toObject(): GroupProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do grupo é obrigatório.");
    }

    return name.trim();
  }

}
