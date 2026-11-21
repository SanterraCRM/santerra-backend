import { container } from "tsyringe";

import { POG_POC_GATEWAY, PogPocGateway } from "./domain/gateways/pogPoc-gateway";
import { HttpPogPocGateway } from "./infrastructure/http/http-pogPoc-gateway";

container.registerSingleton<PogPocGateway>(POG_POC_GATEWAY, HttpPogPocGateway);
