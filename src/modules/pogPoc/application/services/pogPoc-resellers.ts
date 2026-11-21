import { inject, injectable } from "tsyringe";

import { RESELLER_VIEW_REPOSITORY, ResellerViewRepository } from "../../../resellersView";
import { PogPoc } from "../../domain/entities/pogPoc";
import { PogPocResellerDto } from "../dtos/pogPoc-dto";

@injectable()
export class PogPocResellers {
  constructor(
    @inject(RESELLER_VIEW_REPOSITORY)
    private readonly resellerViewRepository: ResellerViewRepository,
  ) {}

  async findByDocument(pogPocs: PogPoc[]): Promise<Map<string, PogPocResellerDto>> {
    const documents = [
      ...new Set(
        pogPocs.map(({ cnpj }) => cnpj).filter((cnpj): cnpj is string => cnpj !== null),
      ),
    ];
    const resellers = await this.resellerViewRepository.findManyByDocuments(documents);
    const byDocument = new Map<string, PogPocResellerDto>();

    resellers.forEach(({ id, document, name, fantasyName }) => {
      const resellerName = name || fantasyName;

      if (id !== null && document && resellerName && !byDocument.has(document)) {
        byDocument.set(document, { id, name: resellerName });
      }
    });

    return byDocument;
  }
}
