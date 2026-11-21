import { inject, injectable } from "tsyringe";

import { POG_POC_GATEWAY, PogPocGateway } from "../../domain/gateways/pogPoc-gateway";
import { PogPocFilterOptionsDto } from "../dtos/pogPoc-dto";

@injectable()
export class GetPogPocFilterOptionsUseCase {
  constructor(
    @inject(POG_POC_GATEWAY)
    private readonly pogPocGateway: PogPocGateway,
  ) {}

  execute(): Promise<PogPocFilterOptionsDto> {
    return this.pogPocGateway.findFilterOptions();
  }
}
