import { ProducerProps } from "../../domain/entities/producer";
import { ProducerPerson } from "../../domain/repositories/producer-repository";

export interface ProducerListItemDto extends ProducerProps {
  person: ProducerPerson;
}
