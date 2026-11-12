import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export interface EmployeeProps {
  id: string;
  personId: string;
  userCompanyId: string | null;
  hiredAt: Date | null;
  terminatedAt: Date | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateEmployeeProps {
  personId: string;
  userCompanyId?: string | null;
  hiredAt?: Date | null;
  terminatedAt?: Date | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateEmployeeProps {
  personId?: string;
  userCompanyId?: string | null;
  hiredAt?: Date | null;
  terminatedAt?: Date | null;
  updatedById?: string | null;
}

export class Employee {
  private constructor(private readonly props: EmployeeProps) {}

  static create(
    input: CreateEmployeeProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Employee {
    const personId = Employee.normalizePersonId(input.personId);
    const hiredAt = input.hiredAt ?? null;
    const terminatedAt = input.terminatedAt ?? null;

    Employee.ensureDateRange(hiredAt, terminatedAt);

    return new Employee({
      id,
      personId,
      userCompanyId: input.userCompanyId ?? null,
      hiredAt,
      terminatedAt,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: EmployeeProps): Employee {
    return new Employee({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get personId(): string {
    return this.props.personId;
  }

  get userCompanyId(): string | null {
    return this.props.userCompanyId;
  }

  isActive(now = new Date()): boolean {
    return this.props.terminatedAt === null || this.props.terminatedAt > now;
  }

  update(input: UpdateEmployeeProps, updatedAt = new Date()): void {
    if (input.personId !== undefined) {
      this.props.personId = Employee.normalizePersonId(input.personId);
    }

    if (input.userCompanyId !== undefined) {
      this.props.userCompanyId = input.userCompanyId;
    }

    if (input.hiredAt !== undefined) {
      this.props.hiredAt = input.hiredAt;
    }

    if (input.terminatedAt !== undefined) {
      this.props.terminatedAt = input.terminatedAt;
    }

    Employee.ensureDateRange(this.props.hiredAt, this.props.terminatedAt);

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.userCompanyId = null;
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): EmployeeProps {
    return { ...this.props };
  }

  private static normalizePersonId(personId: string): string {
    if (typeof personId !== "string" || personId.trim().length === 0) {
      throw new DomainError("O ID da pessoa é obrigatório.");
    }

    return personId.trim();
  }

  private static ensureDateRange(hiredAt: Date | null, terminatedAt: Date | null): void {
    if (hiredAt && terminatedAt && terminatedAt < hiredAt) {
      throw new DomainError("A data de desligamento não pode ser anterior à de admissão.");
    }
  }
}
