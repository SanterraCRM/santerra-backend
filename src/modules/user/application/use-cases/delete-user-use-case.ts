import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user-repository";

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, context: AuthContext): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    user.delete(context.userId);
    await this.userRepository.delete(user);
  }
}
