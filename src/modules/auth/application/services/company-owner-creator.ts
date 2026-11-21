import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";

import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { Company, prepareCompanyLogo } from "../../../company";
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
  companyLogo?: Buffer;
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
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async create({
    owner,
    companyName,
    companyDescription,
    companyLogo,
    newUser,
    emailVerification,
    createdById = owner.id,
  }: CreateCompanyWithOwnerInput): Promise<Company> {
    const companyId = randomUUID();
    const logo = companyLogo ? prepareCompanyLogo(companyId, companyLogo) : null;
    const company = Company.create(
      {
        name: companyName,
        description: companyDescription,
        logo: logo?.key ?? null,
        createdById,
      },
      companyId,
    );
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

    if (logo) {
      await this.storageProvider.save(logo.key, logo.content);
    }

    try {
      await this.authRepository.createCompanyWithOwner({
        user: newUser,
        company,
        ownerRole,
        owner: ownerMember,
        emailVerification,
      });
    } catch (error) {
      if (logo) {
        await this.storageProvider.delete(logo.key).catch(() => undefined);
      }

      throw error;
    }

    return company;
  }
}
