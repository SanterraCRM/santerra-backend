import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  ConflictError,
  ForbiddenError,
  ResourceNotFoundError,
  ValidationError,
} from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import { ROLE_REPOSITORY, RoleRepository } from "../../../role";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { Member } from "../../domain/entities/member";
import {
  MEMBER_REPOSITORY,
  MemberAccess,
  MemberRepository,
} from "../../domain/repositories/member-repository";

export interface MemberAccessInput {
  email: string;
  name?: string | null;
  password?: string;
  roleIds?: string[];
}

function getMissingAccountMessage(hasName: boolean, hasPassword: boolean): string {
  if (!hasName && !hasPassword) {
    return "Este e-mail ainda não tem conta. Informe o nome e a senha inicial para criá-la.";
  }

  return hasName
    ? "Este e-mail ainda não tem conta. Informe a senha inicial para criá-la."
    : "Este e-mail ainda não tem conta. Informe o nome para criá-la.";
}

@injectable()
export class MemberAccessBuilder {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly permissionScope: PermissionScope,
  ) {}

  async build(input: MemberAccessInput, context: TenantContext): Promise<MemberAccess> {
    if (!context.permissions.includes(PERMISSIONS.MEMBERS_CREATE)) {
      throw new ForbiddenError("Você não tem permissão para dar acesso à empresa.");
    }

    const email = User.normalizeEmail(input.email);
    const roleIds = [...new Set(input.roleIds ?? [])];
    const roles = await this.roleRepository.findManyByIds(roleIds, context.companyId);

    if (roles.length !== roleIds.length) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    await this.permissionScope.ensureWithin(
      roles.flatMap((role) => role.permissionIds),
      context,
    );

    let newUser: User | null = null;
    let user = await this.userRepository.findByEmail(email);
    const existingMember = user
      ? await this.memberRepository.findByUserId(user.id, context.companyId, true)
      : null;

    if (existingMember && !existingMember.isDeleted) {
      throw new ConflictError("Este usuário já faz parte da empresa.", "ALREADY_MEMBER");
    }

    if (user && !user.active) {
      throw new ValidationError(
        "Esta conta está inativa na plataforma, então não pode entrar na empresa.",
      );
    }

    if (!user) {
      newUser = await this.createUser(email, input, context.userId);
      user = newUser;
    }

    const member =
      existingMember ??
      Member.create({
        userId: user.id,
        companyId: context.companyId,
        name: user.name,
        email: user.email,
        roleIds,
        createdById: context.userId,
      });

    if (existingMember) {
      existingMember.restore(roleIds, context.userId);
    }

    return { member, newUser, addedById: context.userId };
  }

  private async createUser(
    email: string,
    input: MemberAccessInput,
    createdById: string,
  ): Promise<User> {
    const name = input.name?.trim();

    if (!name || !input.password) {
      throw new ValidationError(
        getMissingAccountMessage(Boolean(name), Boolean(input.password)),
        "ACCOUNT_DETAILS_REQUIRED",
      );
    }

    return User.create({
      name,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      createdById,
    });
  }
}
