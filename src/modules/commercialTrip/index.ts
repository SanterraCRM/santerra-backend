import "./commercialTrip-container";

export { CommercialTrip } from "./domain/entities/commercialTrip";
export { COMMERCIAL_TRIP_REPOSITORY } from "./domain/repositories/commercialTrip-repository";
export type { CommercialTripRepository } from "./domain/repositories/commercialTrip-repository";
export { commercialTripRouter } from "./presentation/http/commercialTrip-routes";
