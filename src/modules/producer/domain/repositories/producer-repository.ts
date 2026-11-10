import { CommercialUsage } from "../../../../shared/domain/commercial-usage";
import { Producer } from "../entities/producer";

export const PRODUCER_REPOSITORY = "ProducerRepository";

export interface FindProducersParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  potentialId?: string;
  includeDeleted: boolean;
}

export interface ProducerPerson {
  id: string;
  name: string;
  nationalId: string | null;
}

export interface ProducerListItem {
  producer: Producer;
  person: ProducerPerson;
}

export interface FindProducersResult {
  producers: ProducerListItem[];
  total: number;
}

export interface ProducerRepository {
  create(producer: Producer): Promise<Producer>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Producer | null>;
  findByPersonId(personId: string, companyId: string): Promise<Producer | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Producer[]>;
  findListItemById(id: string, companyId: string): Promise<ProducerListItem | null>;
  findMany(params: FindProducersParams): Promise<FindProducersResult>;
  countCommercialUsage(id: string, companyId: string): Promise<CommercialUsage>;
  update(producer: Producer): Promise<Producer>;
  delete(producer: Producer): Promise<void>;
}
