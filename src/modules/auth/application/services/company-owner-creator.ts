import { inject, injectable } from "tsyringe";

import { Company } from "../../../company";
import { Member } from "../../../member";
import { PERMISSION_REPOSITORY, PermissionRepository } from "../../../permission";
import { Role } from "../../../role";
import { User } from "../../../user";
import { EmailVerification } from "../../domain/entities/email-verification";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "../../domain/repositories/auth-repository";

const OWNER_ROLE_NAME = "Administrador";
const OWNER_ROLE_DESCRIPTION = "Acesso a todas as funcionalidades da empresa.";

interface CreateCompanyWithOwnerInput {
  owner: User;
  companyName: string;
  companyDescription?: string | null;
  newUser?: User;
  emailVerification?: EmailVerification;
  createdById?: string;
}

@injectable()
export class CompanyOwnerCreator {
  constructor(
    @inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create({
    owner,
    companyName,
    companyDescription,
    newUser,
    emailVerification,
    createdById = owner.id,
  }: CreateCompanyWithOwnerInput): Promise<Company> {
    const company = Company.create({
      name: companyName,
      description: companyDescription,
      createdById,
    });
    const permissions = await this.permissionRepository.findAll();
    const ownerRole = Role.create({
      name: OWNER_ROLE_NAME,
      description: OWNER_ROLE_DESCRIPTION,
      companyId: company.id,
      permissionIds: permissions.map((permission) => permission.id),
      createdById,
    });
    const ownerMember = Member.create({
      userId: owner.id,
      companyId: company.id,
      name: owner.name,
      email: owner.email,
      isOwner: true,
      roleIds: [ownerRole.id],
      createdById,
    });

    await this.authRepository.createCompanyWithOwner({
      user: newUser,
      company,
      ownerRole,
      owner: ownerMember,
      emailVerification,
    });

    return company;
  }
}
