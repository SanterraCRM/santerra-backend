import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { COMPANY_REPOSITORY, CompanyRepository } from "../../../company";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import { Invitation } from "../../domain/entities/invitation";
import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "../../domain/repositories/invitation-repository";
import { InvitationPreviewDto } from "../dtos/invitation-preview-dto";

@injectable()
export class PreviewInvitationUseCase {
  constructor(
    @inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<InvitationPreviewDto> {
    const invitation = await this.invitationRepository.findByTokenHash(
      Invitation.hashToken(token),
    );
    const company = invitation && !invitation.isDeleted
      ? await this.companyRepository.findById(invitation.companyId)
      : null;

    if (!invitation || !company?.active) {
      throw new ResourceNotFoundError(
        "Convite não encontrado. Ele pode ter sido cancelado ou trocado por um mais novo.",
      );
    }

    return {
      email: invitation.email,
      companyName: company.toObject().name,
      accountExists: Boolean(await this.userRepository.findByEmail(invitation.email)),
      status: this.getStatus(invitation),
      expiresAt: invitation.expiresAt,
    };
  }

  private getStatus(invitation: Invitation): InvitationPreviewDto["status"] {
    if (invitation.isAccepted) {
      return "accepted";
    }

    return invitation.isExpired() ? "expired" : "pending";
  }
}
