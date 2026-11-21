import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { POG_POC_GATEWAY, PogPocGateway } from "../../domain/gateways/pogPoc-gateway";
import { PogPocDto, toPogPocDto } from "../dtos/pogPoc-dto";
import { PogPocResellers } from "../services/pogPoc-resellers";

@injectable()
export class GetPogPocUseCase {
  constructor(
    @inject(POG_POC_GATEWAY)
    private readonly pogPocGateway: PogPocGateway,
    private readonly pogPocResellers: PogPocResellers,
  ) {}

  async execute(productCode: number): Promise<PogPocDto[]> {
    const pogPocs = await this.pogPocGateway.findByProductCode(productCode);

    if (pogPocs.length === 0) {
      throw new ResourceNotFoundError("POG/POC não encontrado.");
    }

    const resellers = await this.pogPocResellers.findByDocument(pogPocs);

    return pogPocs.map((pogPoc) => toPogPocDto(pogPoc, resellers));
  }
}
