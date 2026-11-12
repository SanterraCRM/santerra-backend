export interface CommercialUsage {
  commercialTrips: number;
  commercialActions: number;
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
  ].filter((part) => part !== null);

  return parts.length > 0 ? parts.join(" e ") : null;
}
