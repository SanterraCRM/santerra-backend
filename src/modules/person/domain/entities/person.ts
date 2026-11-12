import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface PersonProps {
  id: string;
  name: string;
  nationalId: string | null;
  phoneNumber: string | null;
  email: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreatePersonProps {
  name: string;
  nationalId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdatePersonProps {
  name?: string;
  nationalId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  updatedById?: string | null;
}

export class Person {
  private constructor(private readonly props: PersonProps) {}

  static create(
    input: CreatePersonProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Person {
    const name = Person.normalizeName(input.name);

    return new Person({
      id,
      name,
      nationalId: input.nationalId ?? null,
      phoneNumber: input.phoneNumber ?? null,
      email: input.email ?? null,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: PersonProps): Person {
    return new Person({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  update(input: UpdatePersonProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Person.normalizeName(input.name);
    }

    if (input.nationalId !== undefined) {
      this.props.nationalId = input.nationalId;
    }

    if (input.phoneNumber !== undefined) {
      this.props.phoneNumber = input.phoneNumber;
    }

    if (input.email !== undefined) {
      this.props.email = input.email;
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): PersonProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome da pessoa é obrigatório.");
    }

    return name.trim();
  }

}
