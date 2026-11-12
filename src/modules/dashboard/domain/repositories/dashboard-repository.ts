export const DASHBOARD_REPOSITORY = "DashboardRepository";

export interface DashboardRelation {
  id: string;
  name: string;
}

export interface PotentialCount extends DashboardRelation {
  count: number;
}

export interface EventTotal extends DashboardRelation {
  total: number;
}

export interface TripStatusCounts {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export interface UpcomingTrip {
  id: string;
  status: keyof TripStatusCounts;
  expectedDate: Date | null;
  producer: DashboardRelation;
  responsible: DashboardRelation;
}

export interface RecentAction {
  id: string;
  description: string | null;
  price: number | null;
  initialDate: Date | null;
  event: DashboardRelation;
  wallet: DashboardRelation;
}

export interface WalletSummary {
  count: number;
  totalBalance: number;
}

export interface DashboardRepository {
  countProducersByPotential(companyId: string): Promise<PotentialCount[]>;
  countTripsByStatus(companyId: string): Promise<TripStatusCounts>;
  findUpcomingTrips(companyId: string, from: Date, limit: number): Promise<UpcomingTrip[]>;
  sumActionsByEvent(companyId: string, from: Date, to: Date): Promise<EventTotal[]>;
  findRecentActions(companyId: string, limit: number): Promise<RecentAction[]>;
  summarizeWallets(companyId: string): Promise<WalletSummary>;
}
