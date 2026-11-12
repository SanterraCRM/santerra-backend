import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import { ConflictError } from "../../../../shared/errors/app-error";
import { PublicUserProps, User } from "../../domain/entities/user";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user-repository";
import { CreateUserDto } from "../dtos/create-user-dto";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    input: CreateUserDto,
    context: AuthContext,
  ): Promise<PublicUserProps> {
    const email = User.normalizeEmail(input.email);

    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictError("Já existe um usuário com este e-mail.");
    }

    const user = User.create({
      name: input.name,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      active: input.active,
      createdById: context.userId,
    });
    const createdUser = await this.userRepository.create(user);

    return createdUser.toPublicObject();
  }
}
