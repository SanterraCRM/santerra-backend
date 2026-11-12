import "./permission-container";

export { PermissionScope } from "./application/services/permission-scope";
export { Permission } from "./domain/entities/permission";
export { PERMISSION_REPOSITORY } from "./domain/repositories/permission-repository";
export type { PermissionRepository } from "./domain/repositories/permission-repository";
export { permissionRouter } from "./presentation/http/permission-routes";
