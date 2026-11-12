import "./manufacturer-container";

export { Manufacturer } from "./domain/entities/manufacturer";
export { MANUFACTURER_REPOSITORY } from "./domain/repositories/manufacturer-repository";
export type { ManufacturerRepository } from "./domain/repositories/manufacturer-repository";
export { manufacturerRouter } from "./presentation/http/manufacturer-routes";
