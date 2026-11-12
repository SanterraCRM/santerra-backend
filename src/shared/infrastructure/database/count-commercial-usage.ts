import { Prisma, PrismaClient } from "@prisma/client";

import { CommercialUsage } from "../../domain/commercial-usage";

interface CommercialUsageLinks {
  employee?: Prisma.EmployeeWhereInput;
  producer?: Prisma.ProducerWhereInput;
}

export async function countCommercialUsage(
  prisma: PrismaClient,
  companyId: string,
  { employee, producer }: CommercialUsageLinks,
): Promise<CommercialUsage> {
  const trips: Prisma.CommercialTripWhereInput[] = [];
  const actions: Prisma.CommercialActionWhereInput[] = [];

  if (employee) {
    trips.push({ responsible: employee }, { participants: { some: { employee } } });
    actions.push({ responsible: employee }, { participants: { some: { employee } } });
  }

  if (producer) {
    trips.push({ producer });
    actions.push({ producerGuests: { some: { producer } } });
  }

  const [commercialTrips, commercialActions] = await prisma.$transaction([
    prisma.commercialTrip.count({ where: { companyId, deletedAt: null, OR: trips } }),
    prisma.commercialAction.count({ where: { companyId, deletedAt: null, OR: actions } }),
  ]);

  return { commercialTrips, commercialActions };
}
