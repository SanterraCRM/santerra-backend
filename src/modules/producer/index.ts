import "./producer-container";

export { Producer } from "./domain/entities/producer";
export { PRODUCER_REPOSITORY } from "./domain/repositories/producer-repository";
export type { ProducerRepository } from "./domain/repositories/producer-repository";
export { producerRouter } from "./presentation/http/producer-routes";
