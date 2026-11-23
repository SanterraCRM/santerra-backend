export interface CommercialUsage {
  commercialTrips: number;
  commercialActions: number;
  goals: number;
}

function countLabel(count: number, singular: string, plural: string): string | null {
  if (count === 0) {
    return null;
  }

  return `${count} ${count === 1 ? singular : plural}`;
}

export function describeCommercialUsage(usage: CommercialUsage): string | null {
  const parts = [
    countLabel(usage.commercialTrips, "visita", "visitas"),
    countLabel(usage.commercialActions, "ação comercial", "ações comerciais"),
    countLabel(usage.goals, "meta", "metas"),
  ].filter((part) => part !== null);

  if (parts.length === 0) {
    return null;
  }

  const last = parts.pop();

  return parts.length > 0 ? `${parts.join(", ")} e ${last}` : `${last}`;
}
