import { CommercialUsage } from "../../../../shared/domain/commercial-usage";
import { Employee } from "../entities/employee";

export const EMPLOYEE_REPOSITORY = "EmployeeRepository";

export interface FindEmployeesParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
  includeDeleted: boolean;
}

export interface EmployeePerson {
  id: string;
  name: string;
  nationalId: string | null;
}

export interface EmployeeListItem {
  employee: Employee;
  person: EmployeePerson;
}

export interface FindEmployeesResult {
  employees: EmployeeListItem[];
  total: number;
}

export interface EmployeeRepository {
  create(employee: Employee): Promise<Employee>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Employee | null>;
  findByPersonId(personId: string, companyId: string): Promise<Employee | null>;
  findByUserCompanyId(userCompanyId: string, companyId: string): Promise<Employee | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Employee[]>;
  findListItemById(id: string, companyId: string): Promise<EmployeeListItem | null>;
  findMany(params: FindEmployeesParams): Promise<FindEmployeesResult>;
  countCommercialUsage(id: string, companyId: string): Promise<CommercialUsage>;
  update(employee: Employee): Promise<Employee>;
  delete(employee: Employee): Promise<void>;
}
