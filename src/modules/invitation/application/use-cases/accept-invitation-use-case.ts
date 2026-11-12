import { inject, injectable } from "tsyringe";

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  ConflictError,
  ResourceNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../../shared/errors/app-error";
import { COMPANY_REPOSITORY, CompanyRepository } from "../../../company";
import { Member, MEMBER_REPOSITORY, MemberRepository } from "../../../member";
import { ROLE_REPOSITORY, RoleRepository } from "../../../role";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { Invitation } from "../../domain/entities/invitation";
import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "../../domain/repositories/invitation-repository";
import { AcceptInvitationDto } from "../dtos/accept-invitation-dto";
import { AcceptInvitationResultDto } from "../dtos/accept-invitation-result-dto";

@injectable()
export class AcceptInvitationUseCase {
  constructor(
    @inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AcceptInvitationDto): Promise<AcceptInvitationResultDto> {
    const invitation = await this.invitationRepository.findByTokenHash(
      Invitation.hashToken(input.token),
    );

    if (
      !invitation ||
      !invitation.isPending() ||
      !(await this.companyRepository.findById(invitation.companyId))
    ) {
      throw new ResourceNotFoundError("Convite inválido ou expirado.");
    }

    let newUser: User | null = null;
    let user = await this.userRepository.findByEmail(invitation.email);

    if (user) {
      await this.ensureAccountOwner(user, input);
    } else {
      newUser = await this.createUser(invitation.email, input);
      user = newUser;
    }

    const existingMember = await this.memberRepository.findByUserId(
      user.id,
      invitation.companyId,
      true,
    );

    if (existingMember && !existingMember.isDeleted) {
      throw new ConflictError("Você já faz parte desta empresa.");
    }

    const roles = await this.roleRepository.findManyByIds(
      invitation.roleIds,
      invitation.companyId,
    );
    const roleIds = roles.map((role) => role.id);

    const member =
      existingMember ??
      Member.create({
        userId: user.id,
        companyId: invitation.companyId,
        name: user.name,
        email: user.email,
        roleIds,
        createdById: invitation.createdById,
      });

    if (existingMember) {
      existingMember.restore(roleIds, invitation.createdById);
    }

    invitation.accept();
    await this.invitationRepository.accept({ invitation, member, newUser });

    return {
      user: user.toPublicObject(),
      companyId: invitation.companyId,
    };
  }

  private async ensureAccountOwner(
    user: User,
    input: AcceptInvitationDto,
  ): Promise<void> {
    if (!input.password) {
      throw new ValidationError(
        "Já existe uma conta com este e-mail. Informe a senha dela para aceitar o convite.",
      );
    }

    if (!(await this.passwordHasher.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedError("Senha incorreta.");
    }
  }

  private async createUser(
    email: string,
    input: AcceptInvitationDto,
  ): Promise<User> {
    if (!input.name || !input.password) {
      throw new ValidationError("Informe nome e senha para criar a sua conta.");
    }

    return User.create({
      name: input.name,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
    });
  }
}
