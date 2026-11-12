import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface RoleProps {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  permissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateRoleProps {
  name: string;
  description?: string | null;
  companyId: string;
  permissionIds?: string[];
  createdById?: string | null;
}

export interface UpdateRoleProps {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
  updatedById?: string | null;
}

export class Role {
  private constructor(private readonly props: RoleProps) {}

  static create(
    input: CreateRoleProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Role {
    const name = Role.normalizeName(input.name);

    return new Role({
      id,
      name,
      description: input.description ?? null,
      companyId: input.companyId,
      permissionIds: Role.normalizePermissionIds(input.permissionIds ?? []),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: RoleProps): Role {
    return new Role({ ...props, permissionIds: [...props.permissionIds] });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get permissionIds(): string[] {
    return [...this.props.permissionIds];
  }

  update(input: UpdateRoleProps, updatedAt = new Date()): void {
    if (input.name !== undefined) {
      this.props.name = Role.normalizeName(input.name);
    }

    if (input.description !== undefined) {
      this.props.description = input.description;
    }

    if (input.permissionIds !== undefined) {
      this.props.permissionIds = Role.normalizePermissionIds(input.permissionIds);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): RoleProps {
    return { ...this.props, permissionIds: [...this.props.permissionIds] };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome do cargo é obrigatório.");
    }

    return name.trim();
  }

  private static normalizePermissionIds(permissionIds: string[]): string[] {
    return [...new Set(permissionIds)];
  }
}
