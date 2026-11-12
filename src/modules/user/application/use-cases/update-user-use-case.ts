import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PublicUserProps, User } from "../../domain/entities/user";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user-repository";
import { UpdateUserDto } from "../dtos/update-user-dto";

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    id: string,
    input: UpdateUserDto,
    context: AuthContext,
  ): Promise<PublicUserProps> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    if (input.email !== undefined) {
      const owner = await this.userRepository.findByEmail(
        User.normalizeEmail(input.email),
      );

      if (owner && owner.id !== user.id) {
        throw new ConflictError("Já existe um usuário com este e-mail.");
      }
    }

    user.update({
      name: input.name,
      email: input.email,
      active: input.active,
      passwordHash:
        input.password !== undefined
          ? await this.passwordHasher.hash(input.password)
          : undefined,
      updatedById: context.userId,
    });
    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toPublicObject();
  }
}
