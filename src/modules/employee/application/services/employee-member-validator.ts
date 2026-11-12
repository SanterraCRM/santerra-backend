import { inject, injectable } from "tsyringe";

import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { MEMBER_REPOSITORY, MemberRepository } from "../../../member";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";

@injectable()
export class EmployeeMemberValidator {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async ensureAvailable(
    userCompanyId: string,
    companyId: string,
    employeeId?: string,
  ): Promise<void> {
    if (!(await this.memberRepository.findById(userCompanyId, companyId))) {
      throw new ResourceNotFoundError("Membro não encontrado.");
    }

    const owner = await this.employeeRepository.findByUserCompanyId(userCompanyId, companyId);

    if (owner && owner.id !== employeeId) {
      throw new ConflictError(
        "Este membro já está vinculado a outro funcionário.",
        "MEMBER_ALREADY_LINKED",
      );
    }
  }
}
