import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Event } from "../../domain/entities/event";
import {
  EventRepository,
  FindEventsParams,
  FindEventsResult,
} from "../../domain/repositories/event-repository";
import { PrismaEventMapper } from "./prisma-event-mapper";

const ACTIVE_ACTIONS: Prisma.CommercialActionWhereInput = { deletedAt: null };

@injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(event: Event): Promise<Event> {
    const data = event.toObject();
    const createdEvent = await this.prisma.event.create({ data });

    return PrismaEventMapper.toDomain(createdEvent);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Event | null> {
    const event = await this.prisma.event.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return event ? PrismaEventMapper.toDomain(event) : null;
  }

  async findByName(name: string, companyId: string): Promise<Event | null> {
    const event = await this.prisma.event.findFirst({
      where: { name, companyId, deletedAt: null },
    });

    return event ? PrismaEventMapper.toDomain(event) : null;
  }

  async findMany(params: FindEventsParams): Promise<FindEventsResult> {
    const where: Prisma.EventWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      createdAt: { gte: params.createdFrom, lte: params.createdTo },
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        include: {
          _count: { select: { actions: { where: ACTIVE_ACTIONS } } },
        },
        orderBy:
          params.sort === "name" ? [{ name: "asc" }, { id: "asc" }] : { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      events: events.map((event) => ({
        event: PrismaEventMapper.toDomain(event),
        actionsCount: event._count.actions,
      })),
      total,
    };
  }

  async countActions(id: string, companyId: string): Promise<number> {
    return this.prisma.commercialAction.count({
      where: { ...ACTIVE_ACTIONS, eventId: id, companyId },
    });
  }

  async update(event: Event): Promise<Event> {
    const data = event.toObject();
    const updatedEvent = await this.prisma.event.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaEventMapper.toDomain(updatedEvent);
  }

  async delete(event: Event): Promise<void> {
    const data = event.toObject();

    await this.prisma.event.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }
}
