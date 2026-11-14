import { inject, injectable } from "tsyringe";

import {
  CreatePlatformCompanyInput,
  PlatformCompanyCreator,
} from "../../../../shared/application/companies/platform-company-creator";
import { ResourceNotFoundError, ValidationError } from "../../../../shared/errors/app-error";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { CompanyOwnerCreator } from "./company-owner-creator";

@injectable()
export class PlatformCompanyCreatorService implements PlatformCompanyCreator {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly companyOwnerCreator: CompanyOwnerCreator,
  ) {}

  async create({
    ownerEmail,
    companyName,
    companyDescription,
    companyLogo,
    createdById,
  }: CreatePlatformCompanyInput): Promise<string> {
    const owner = await this.userRepository.findByEmail(User.normalizeEmail(ownerEmail));

    if (!owner) {
      throw new ResourceNotFoundError(
        "Nenhum usuário com este e-mail. Cadastre o usuário antes de criar a empresa.",
      );
    }

    if (!owner.active) {
      throw new ValidationError("Este usuário está inativo. Ative o usuário antes de torná-lo dono.");
    }

    const company = await this.companyOwnerCreator.create({
      owner,
      companyName,
      companyDescription,
      companyLogo,
      createdById,
    });

    return company.id;
  }
}
