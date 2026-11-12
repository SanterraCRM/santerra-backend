import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { UnauthorizedError } from "../../../../shared/errors/app-error";
import { PublicUserProps, USER_REPOSITORY, UserRepository } from "../../../user";
import { UpdateProfileDto } from "../dtos/update-profile-dto";

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: UpdateProfileDto,
    context: AuthContext,
  ): Promise<PublicUserProps> {
    const user = await this.userRepository.findById(context.userId);

    if (!user) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    user.update({ name: input.name, updatedById: user.id });
    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toPublicObject();
  }
}
