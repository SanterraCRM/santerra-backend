import { injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ValidationError } from "../../../../shared/errors/app-error";
import { MemberAccess, MemberAccessBuilder } from "../../../member";
import { EmployeeAccessDto } from "../dtos/employee-access-dto";

interface EmployeeAccessPerson {
  name: string;
  email?: string | null;
}

interface EmployeeAccessRequest {
  userCompanyId?: string | null;
  access?: EmployeeAccessDto;
}

@injectable()
export class EmployeeAccessPreparer {
  constructor(private readonly memberAccessBuilder: MemberAccessBuilder) {}

  async prepare(
    person: EmployeeAccessPerson,
    { userCompanyId, access }: EmployeeAccessRequest,
    context: TenantContext,
  ): Promise<MemberAccess | null> {
    if (!access) {
      return null;
    }

    if (userCompanyId) {
      throw new ValidationError("Escolha um membro da equipe ou crie o acesso, não os dois.");
    }

    if (!person.email) {
      throw new ValidationError(
        "Informe o e-mail da pessoa para dar acesso à empresa.",
        "ACCESS_EMAIL_REQUIRED",
      );
    }

    return this.memberAccessBuilder.build(
      { email: person.email, name: person.name, ...access },
      context,
    );
  }
}
