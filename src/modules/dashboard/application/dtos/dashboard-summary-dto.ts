import {
  EventTotal,
  PotentialCount,
  RecentAction,
  TripStatusCounts,
  UpcomingTrip,
  WalletSummary,
} from "../../domain/repositories/dashboard-repository";

export interface DashboardSummaryDto {
  producers: { total: number; byPotential: PotentialCount[] } | null;
  trips: { byStatus: TripStatusCounts; upcoming: UpcomingTrip[] } | null;
  actions: {
    month: string;
    monthTotal: number;
    byEvent: EventTotal[];
    recent: RecentAction[];
  } | null;
  wallets: WalletSummary | null;
}
