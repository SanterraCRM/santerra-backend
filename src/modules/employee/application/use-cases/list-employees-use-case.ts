import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "../../domain/repositories/employee-repository";
import { EmployeeListItemDto } from "../dtos/employee-list-item-dto";
import { ListEmployeesDto } from "../dtos/list-employee-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListEmployeesUseCase {
  constructor(
    @inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    input: ListEmployeesDto,
    context: TenantContext,
  ): Promise<PaginatedDto<EmployeeListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.employeeRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      active: input.active,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.employees.map(({ employee, person }) => ({
        ...employee.toObject(),
        person,
      })),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
