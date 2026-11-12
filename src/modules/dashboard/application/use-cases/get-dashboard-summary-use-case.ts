import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { startOfLocalDay, toLocalDateParts } from "../../../../shared/domain/local-date";
import {
  DASHBOARD_REPOSITORY,
  DashboardRepository,
} from "../../domain/repositories/dashboard-repository";
import { DashboardSummaryDto } from "../dtos/dashboard-summary-dto";

const UPCOMING_TRIPS_LIMIT = 5;
const RECENT_ACTIONS_LIMIT = 5;

@injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async execute(context: TenantContext, now = new Date()): Promise<DashboardSummaryDto> {
    const can = (permission: string) => context.permissions.includes(permission);
    const { companyId } = context;
    const { year, month, day } = toLocalDateParts(now);
    const monthStart = startOfLocalDay(year, month, 1);
    const nextMonthStart = month === 12 ? startOfLocalDay(year + 1, 1, 1) : startOfLocalDay(year, month + 1, 1);

    const [producers, trips, actions, wallets] = await Promise.all([
      can(PERMISSIONS.PRODUCERS_READ)
        ? this.dashboardRepository.countProducersByPotential(companyId)
        : null,
      can(PERMISSIONS.COMMERCIAL_TRIPS_READ)
        ? Promise.all([
            this.dashboardRepository.countTripsByStatus(companyId),
            this.dashboardRepository.findUpcomingTrips(
              companyId,
              startOfLocalDay(year, month, day),
              UPCOMING_TRIPS_LIMIT,
            ),
          ])
        : null,
      can(PERMISSIONS.COMMERCIAL_ACTIONS_READ)
        ? Promise.all([
            this.dashboardRepository.sumActionsByEvent(companyId, monthStart, nextMonthStart),
            this.dashboardRepository.findRecentActions(companyId, RECENT_ACTIONS_LIMIT),
          ])
        : null,
      can(PERMISSIONS.WALLETS_READ) ? this.dashboardRepository.summarizeWallets(companyId) : null,
    ]);

    return {
      producers: producers && {
        total: producers.reduce((total, potential) => total + potential.count, 0),
        byPotential: producers,
      },
      trips: trips && { byStatus: trips[0], upcoming: trips[1] },
      actions: actions && {
        month: `${year}-${String(month).padStart(2, "0")}`,
        monthTotal: Math.round(actions[0].reduce((total, event) => total + event.total * 100, 0)) / 100,
        byEvent: actions[0],
        recent: actions[1],
      },
      wallets,
    };
  }
}
