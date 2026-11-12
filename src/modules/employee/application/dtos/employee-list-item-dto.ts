import { EmployeeProps } from "../../domain/entities/employee";
import { EmployeePerson } from "../../domain/repositories/employee-repository";

export interface EmployeeListItemDto extends EmployeeProps {
  person: EmployeePerson;
}
