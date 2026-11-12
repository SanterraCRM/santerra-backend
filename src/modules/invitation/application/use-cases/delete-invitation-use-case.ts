import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "../../domain/repositories/invitation-repository";

@injectable()
export class DeleteInvitationUseCase {
  constructor(
    @inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const invitation = await this.invitationRepository.findById(
      id,
      context.companyId,
    );

    if (!invitation) {
      throw new ResourceNotFoundError("Convite não encontrado.");
    }

    if (invitation.isAccepted) {
      throw new ConflictError("Este convite já foi aceito.");
    }

    invitation.delete(context.userId);
    await this.invitationRepository.delete(invitation);
  }
}
