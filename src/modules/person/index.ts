import "./person-container";

export { Person } from "./domain/entities/person";
export { PERSON_REPOSITORY } from "./domain/repositories/person-repository";
export type { PersonRepository } from "./domain/repositories/person-repository";
export { personRouter } from "./presentation/http/person-routes";
