import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import {
  DashboardRepository,
  EventTotal,
  PotentialCount,
  RecentAction,
  TripStatusCounts,
  UpcomingTrip,
  WalletSummary,
} from "../../domain/repositories/dashboard-repository";

const personName = { select: { id: true, person: { select: { name: true } } } } as const;

function byName(first: { name: string }, second: { name: string }): number {
  return first.name.localeCompare(second.name, "pt-BR");
}

@injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countProducersByPotential(companyId: string): Promise<PotentialCount[]> {
    const potentials = await this.prisma.potential.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        _count: {
          select: { producers: { where: { deletedAt: null, person: { deletedAt: null } } } },
        },
      },
    });

    return potentials
      .map(({ id, name, _count }) => ({ id, name, count: _count.producers }))
      .sort((first, second) => second.count - first.count || byName(first, second));
  }

  async countTripsByStatus(companyId: string): Promise<TripStatusCounts> {
    const groups = await this.prisma.commercialTrip.groupBy({
      by: ["status"],
      where: { companyId, deletedAt: null },
      _count: { _all: true },
    });
    const counts: TripStatusCounts = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };

    groups.forEach((group) => {
      counts[group.status as keyof TripStatusCounts] = group._count._all;
    });

    return counts;
  }

  async findUpcomingTrips(companyId: string, from: Date, limit: number): Promise<UpcomingTrip[]> {
    const trips = await this.prisma.commercialTrip.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { not: "COMPLETED" },
        expectedDate: { gte: from },
      },
      orderBy: [{ expectedDate: "asc" }, { createdAt: "asc" }],
      take: limit,
      select: {
        id: true,
        status: true,
        expectedDate: true,
        producer: personName,
        responsible: personName,
      },
    });

    return trips.map(({ producer, responsible, status, ...trip }) => ({
      ...trip,
      status: status as UpcomingTrip["status"],
      producer: { id: producer.id, name: producer.person.name },
      responsible: { id: responsible.id, name: responsible.person.name },
    }));
  }

  async sumActionsByEvent(companyId: string, from: Date, to: Date): Promise<EventTotal[]> {
    const groups = await this.prisma.commercialAction.groupBy({
      by: ["eventId"],
      where: { companyId, deletedAt: null, initialDate: { gte: from, lt: to } },
      _sum: { price: true },
    });
    const events = await this.prisma.event.findMany({
      where: { id: { in: groups.map((group) => group.eventId) }, companyId },
      select: { id: true, name: true },
    });

    return groups
      .map((group) => ({
        id: group.eventId,
        name: events.find((event) => event.id === group.eventId)?.name ?? "",
        total: group._sum.price?.toNumber() ?? 0,
      }))
      .sort((first, second) => second.total - first.total || byName(first, second));
  }

  async findRecentActions(companyId: string, limit: number): Promise<RecentAction[]> {
    const actions = await this.prisma.commercialAction.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        description: true,
        price: true,
        initialDate: true,
        event: { select: { id: true, name: true } },
        wallet: { select: { id: true, userCompany: { select: { user: { select: { name: true } } } } } },
      },
    });

    return actions.map(({ price, wallet, ...action }) => ({
      ...action,
      price: price?.toNumber() ?? null,
      wallet: { id: wallet.id, name: wallet.userCompany.user.name },
    }));
  }

  async summarizeWallets(companyId: string): Promise<WalletSummary> {
    const result = await this.prisma.wallet.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { value: true },
      _count: { _all: true },
    });

    return { count: result._count._all, totalBalance: result._sum.value?.toNumber() ?? 0 };
  }
}
