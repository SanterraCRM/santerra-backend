import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface CompanyProps {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateCompanyProps {
  name: string;
  description?: string | null;
  logo?: string | null;
  createdById?: string | null;
}

export interface UpdateCompanyProps {
  name?: string;
  description?: string | null;
  logo?: string | null;
  active?: boolean;
  updatedById?: string | null;
}

export class Company {
  private constructor(private readonly props: CompanyProps) {}

  static create(
    input: CreateCompanyProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Company {
    const name = Company.normalizeName(input.name);

    return new Company({
      id,
      name,
      description: input.description ?? null,
      logo: input.logo ?? null,
      active: true,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: CompanyProps): Company {
    return new Company({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get logo(): string | null {
    return this.props.logo;
  }

  get active(): boolean {
    return this.props.active;
  }

  update(input: UpdateCompanyProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Company.normalizeName(input.name);
    }

    if (input.description !== undefined) {
      this.props.description = input.description;
    }

    if (input.logo !== undefined) {
      this.props.logo = input.logo;
    }

    if (input.active !== undefined) {
      this.props.active = input.active;
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): CompanyProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome da empresa é obrigatório.");
    }

    return name.trim();
  }
}
