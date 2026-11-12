import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface ManufacturerProps {
  id: string;
  name: string;
  registrationNumber: string | null;
  phoneNumber: string | null; 
  email: string | null;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

export type PublicManufacturerProps = Omit<ManufacturerProps, "passwordHash">;

interface CreateManufacturerProps {
  name: string;
  registrationNumber?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  createdById?: string | null;
}

export interface UpdateManufacturerProps {
  name?: string;
  registrationNumber?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  updatedById?: string | null;
}

export class Manufacturer {
  private constructor(private readonly props: ManufacturerProps) {}

  static create(
    input: CreateManufacturerProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Manufacturer {
    const name = Manufacturer.normalizeName(input.name);

    return new Manufacturer({
      id,
      name,
      registrationNumber: input.registrationNumber ?? null,
      phoneNumber: input.phoneNumber ?? null,
      email: input.email ?? null,
      passwordHash: input.passwordHash ?? null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: ManufacturerProps): Manufacturer {
    return new Manufacturer({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdateManufacturerProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Manufacturer.normalizeName(input.name);
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

    if (input.passwordHash !== undefined) {
      this.props.passwordHash = input.passwordHash;
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): ManufacturerProps {
    return { ...this.props };
  }

  toPublicObject(): PublicManufacturerProps {
    const { passwordHash: _passwordHash, ...publicProps } = this.props;

    return publicProps;
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do fabricante é obrigatório.");
    }

    return name.trim();
  }

}
