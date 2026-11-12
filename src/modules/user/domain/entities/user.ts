import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isPlatformAdmin: boolean;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

export type PublicUserProps = Omit<UserProps, "passwordHash">;

interface CreateUserProps {
  name: string;
  email: string;
  passwordHash: string;
  active?: boolean;
  createdById?: string | null;
}

export interface UpdateUserProps {
  name?: string;
  email?: string;
  passwordHash?: string;
  active?: boolean;
  updatedById?: string | null;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(
    input: CreateUserProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): User {
    return new User({
      id,
      name: User.normalizeName(input.name),
      email: User.normalizeEmail(input.email),
      passwordHash: User.ensurePasswordHash(input.passwordHash),
      isPlatformAdmin: false,
      active: input.active ?? true,
      lastLoginAt: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get isPlatformAdmin(): boolean {
    return this.props.isPlatformAdmin;
  }

  get active(): boolean {
    return this.props.active;
  }

  update(input: UpdateUserProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = User.normalizeName(input.name);
    }

    if (input.email !== undefined) {
      this.props.email = User.normalizeEmail(input.email);
    }

    if (input.passwordHash !== undefined) {
      this.props.passwordHash = User.ensurePasswordHash(input.passwordHash);
    }

    if (input.active !== undefined) {
      this.props.active = input.active;
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  registerLogin(lastLoginAt = new Date()): void {
    this.props.lastLoginAt = lastLoginAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): UserProps {
    return { ...this.props };
  }

  toPublicObject(): PublicUserProps {
    const { passwordHash: _passwordHash, ...publicProps } = this.props;

    return publicProps;
  }

  static normalizeEmail(email: string): string {
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new DomainError("O e-mail do usuário é obrigatório.");
    }

    return email.trim().toLowerCase();
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do usuário é obrigatório.");
    }

    return name.trim();
  }

  private static ensurePasswordHash(passwordHash: string): string {
    if (typeof passwordHash !== "string" || passwordHash.length === 0) {
      throw new DomainError("A senha do usuário é obrigatória.");
    }

    return passwordHash;
  }
}
