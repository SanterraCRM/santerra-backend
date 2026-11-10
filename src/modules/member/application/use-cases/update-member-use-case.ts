import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ForbiddenError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import { ROLE_REPOSITORY, RoleRepository } from "../../../role";
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "../../domain/repositories/member-repository";
import { MemberDetailsDto, toMemberDetailsDto } from "../dtos/member-details-dto";
import { UpdateMemberDto } from "../dtos/update-member-dto";

@injectable()
export class UpdateMemberUseCase {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(
    id: string,
    input: UpdateMemberDto,
    context: TenantContext,
  ): Promise<MemberDetailsDto> {
    const member = await this.memberRepository.findById(id, context.companyId);

    if (!member) {
      throw new ResourceNotFoundError("Membro não encontrado.");
    }

    if (member.isOwner) {
      throw new ForbiddenError("O dono da empresa não pode ser alterado nem removido.");
    }

    if (member.userId === context.userId) {
      throw new ForbiddenError("Você não pode alterar o seu próprio acesso.");
    }

    const currentRoles = await this.roleRepository.findManyByIds(
      member.roleIds,
      context.companyId,
    );
    const newRoleIds = [...new Set(input.roleIds ?? [])];
    const newRoles = await this.roleRepository.findManyByIds(
      newRoleIds,
      context.companyId,
    );

    if (newRoles.length !== newRoleIds.length) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    await this.permissionScope.ensureWithin(
      [...currentRoles, ...newRoles].flatMap((role) => role.permissionIds),
      context,
    );

    member.update({ ...input, updatedById: context.userId });
    const updatedMember = await this.memberRepository.update(member);

    return toMemberDetailsDto(updatedMember, context);
  }
}
