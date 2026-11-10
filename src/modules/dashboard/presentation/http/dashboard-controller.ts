import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { GetDashboardSummaryUseCase } from "../../application/use-cases/get-dashboard-summary-use-case";

@injectable()
export class DashboardController {
  constructor(private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase) {}

  summary: RequestHandler = async (request, response) => {
    const summary = await this.getDashboardSummaryUseCase.execute(getTenantContext(request));

    response.status(200).json(summary);
  };
}
