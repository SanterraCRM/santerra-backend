import "./role-container";

export { Role } from "./domain/entities/role";
export { ROLE_REPOSITORY } from "./domain/repositories/role-repository";
export type { RoleRepository } from "./domain/repositories/role-repository";
export { roleRouter } from "./presentation/http/role-routes";
