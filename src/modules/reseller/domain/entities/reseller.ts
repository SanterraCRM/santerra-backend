import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface ResellerProps {
  id: string;
  name: string;
  registrationNumber: string | null;
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

interface CreateResellerProps {
  name: string;
  registrationNumber?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateResellerProps {
  name?: string;
  registrationNumber?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  updatedById?: string | null;
}

export class Reseller {
  private constructor(private readonly props: ResellerProps) {}

  static create(
    input: CreateResellerProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Reseller {
    const name = Reseller.normalizeName(input.name);

    return new Reseller({
      id,
      name,
      registrationNumber: input.registrationNumber ?? null,
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

  static reconstitute(props: ResellerProps): Reseller {
    return new Reseller({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get registrationNumber(): string | null {
    return this.props.registrationNumber;
  }

  update(input: UpdateResellerProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Reseller.normalizeName(input.name);
    }

    if (input.registrationNumber !== undefined) {
      this.props.registrationNumber = input.registrationNumber;
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

  toObject(): ResellerProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do revendedor é obrigatório.");
    }

    return name.trim();
  }

}
