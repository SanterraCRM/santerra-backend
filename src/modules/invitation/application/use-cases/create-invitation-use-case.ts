import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  MAIL_PROVIDER,
  MailProvider,
} from "../../../../shared/application/mail/mail-provider";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { COMPANY_REPOSITORY, CompanyRepository } from "../../../company";
import { MEMBER_REPOSITORY, MemberRepository } from "../../../member";
import { PermissionScope } from "../../../permission";
import { ROLE_REPOSITORY, RoleRepository } from "../../../role";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import {
  Invitation,
  PublicInvitationProps,
} from "../../domain/entities/invitation";
import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "../../domain/repositories/invitation-repository";
import { CreateInvitationDto } from "../dtos/create-invitation-dto";

const INVITATION_TTL_IN_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_ACCEPT_URL = "http://localhost:3000/auth/accept-invitation";

@injectable()
export class CreateInvitationUseCase {
  constructor(
    @inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(MAIL_PROVIDER)
    private readonly mailProvider: MailProvider,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(
    input: CreateInvitationDto,
    context: TenantContext,
  ): Promise<PublicInvitationProps> {
    const email = Invitation.normalizeEmail(input.email);
    const roleIds = [...new Set(input.roleIds ?? [])];
    const roles = await this.roleRepository.findManyByIds(roleIds, context.companyId);

    if (roles.length !== roleIds.length) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    await this.permissionScope.ensureWithin(
      roles.flatMap((role) => role.permissionIds),
      context,
    );

    const user = await this.userRepository.findByEmail(email);

    if (user && (await this.memberRepository.findByUserId(user.id, context.companyId))) {
      throw new ConflictError("Este usuário já faz parte da empresa.");
    }

    const pendingInvitation = await this.invitationRepository.findPendingByEmail(
      email,
      context.companyId,
    );

    if (pendingInvitation) {
      pendingInvitation.delete(context.userId);
      await this.invitationRepository.delete(pendingInvitation);
    }

    const { token, tokenHash } = Invitation.createToken();
    const invitation = Invitation.create({
      email,
      roleIds,
      tokenHash,
      expiresAt: new Date(Date.now() + INVITATION_TTL_IN_DAYS * MILLISECONDS_PER_DAY),
      companyId: context.companyId,
      createdById: context.userId,
    });
    const createdInvitation = await this.invitationRepository.create(invitation);

    await this.sendInvitationEmail(email, token, context.companyId);

    return createdInvitation.toPublicObject();
  }

  private async sendInvitationEmail(
    email: string,
    token: string,
    companyId: string,
  ): Promise<void> {
    const company = await this.companyRepository.findById(companyId);
    const companyName = company?.toObject().name ?? "uma empresa";
    const acceptUrl = process.env.INVITATION_ACCEPT_URL ?? DEFAULT_ACCEPT_URL;

    await this.mailProvider.send({
      to: email,
      subject: `Convite para ${companyName}`,
      text: [
        `Você foi convidado para participar de ${companyName} no Santerra.`,
        `Para aceitar, acesse: ${acceptUrl}?token=${token}`,
        `O convite expira em ${INVITATION_TTL_IN_DAYS} dias.`,
      ].join("\n"),
    });
  }
}
