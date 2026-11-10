import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ForbiddenError,
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import { ROLE_REPOSITORY, RoleRepository } from "../../../role";
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "../../domain/repositories/member-repository";

@injectable()
export class DeleteMemberUseCase {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const member = await this.memberRepository.findById(id, context.companyId);

    if (!member) {
      throw new ResourceNotFoundError("Membro não encontrado.");
    }

    if (member.isOwner) {
      throw new ForbiddenError("O dono da empresa não pode ser alterado nem removido.");
    }

    if (member.userId === context.userId) {
      throw new ForbiddenError("Você não pode remover a si mesmo da empresa.");
    }

    const roles = await this.roleRepository.findManyByIds(
      member.roleIds,
      context.companyId,
    );
    await this.permissionScope.ensureWithin(
      roles.flatMap((role) => role.permissionIds),
      context,
    );

    const wallet = await this.memberRepository.findWalletUsage(member.id, context.companyId);

    if (wallet && wallet.actionsCount > 0) {
      const actions =
        wallet.actionsCount === 1 ? "1 ação comercial" : `${wallet.actionsCount} ações comerciais`;

      throw new ResourceInUseError(
        `A carteira deste membro está em uso por ${actions}. Desative o membro em vez de removê-lo.`,
      );
    }

    if (wallet && wallet.balance > 0) {
      throw new ResourceInUseError(
        "A carteira deste membro ainda tem saldo. Desative o membro ou exclua a carteira antes de removê-lo.",
      );
    }

    member.delete(context.userId);
    await this.memberRepository.delete(member);
  }
}
