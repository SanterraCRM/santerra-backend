import { CommercialUsage } from "../../../../shared/domain/commercial-usage";
import { Employee } from "../../../employee/domain/entities/employee";
import { Producer } from "../../../producer/domain/entities/producer";
import { Person } from "../entities/person";

export const PERSON_REPOSITORY = "PersonRepository";

export const PERSON_TYPES = ["employee", "producer"] as const;
export type PersonType = (typeof PERSON_TYPES)[number];

export const PERSON_OPTIONAL_FIELDS = ["nationalId", "phoneNumber", "email"] as const;
export type PersonOptionalField = (typeof PERSON_OPTIONAL_FIELDS)[number];

export interface FindPersonsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  type?: PersonType;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: PersonOptionalField[];
  includeDeleted: boolean;
}

export interface PersonEmployee {
  id: string;
  hiredAt: Date | null;
  terminatedAt: Date | null;
  member: { id: string; name: string; email: string } | null;
}

export interface PersonProducer {
  id: string;
  potential: { id: string; name: string };
  address: string | null;
  mainCrop: string | null;
  totalArea: number | null;
}

export interface PersonDetails {
  person: Person;
  employee: PersonEmployee | null;
  producer: PersonProducer | null;
}

export interface PersonLinks {
  employee?: Employee;
  producer?: Producer;
}

export interface FindPersonsResult {
  persons: PersonDetails[];
  total: number;
}

export interface PersonRepository {
  create(person: Person, links?: PersonLinks): Promise<PersonDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Person | null>;
  findDetailsById(id: string, companyId: string): Promise<PersonDetails | null>;
  findByNationalId(nationalId: string, companyId: string): Promise<Person | null>;
  findMany(params: FindPersonsParams): Promise<FindPersonsResult>;
  countCommercialUsage(id: string, companyId: string): Promise<CommercialUsage>;
  update(person: Person): Promise<PersonDetails>;
  delete(person: Person): Promise<void>;
}
