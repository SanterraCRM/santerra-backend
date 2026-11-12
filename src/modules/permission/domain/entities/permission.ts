import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface PermissionProps {
  id: string;
  name: string;
  description: string | null;
}

interface CreatePermissionProps {
  name: string;
  description?: string | null;
}

export interface UpdatePermissionProps {
  name?: string;
  description?: string | null;
}

export class Permission {
  private constructor(private readonly props: PermissionProps) {}

  static create(
    input: CreatePermissionProps,
    id = randomUUID(),
  ): Permission {
    const name = Permission.normalizeName(input.name);

    return new Permission({
      id,
      name,
      description: input.description ?? null,
    });
  }

  static reconstitute(props: PermissionProps): Permission {
    return new Permission({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  update(input: UpdatePermissionProps): void {
    if (input.name !== undefined) {
      this.props.name = Permission.normalizeName(input.name);
    }

    if (input.description !== undefined) {
      this.props.description = input.description;
    }
  }

  toObject(): PermissionProps {
    return { ...this.props };
  }

  private static normalizeName(name: string): string {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new DomainError("O nome da permissão é obrigatória.");
    }

    return name.trim();
  }
}
