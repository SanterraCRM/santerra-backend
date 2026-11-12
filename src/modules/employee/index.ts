import "./employee-container";

export { Employee } from "./domain/entities/employee";
export { EMPLOYEE_REPOSITORY } from "./domain/repositories/employee-repository";
export type { EmployeeRepository } from "./domain/repositories/employee-repository";
export { employeeRouter } from "./presentation/http/employee-routes";
