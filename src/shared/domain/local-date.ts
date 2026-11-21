const LOCAL_TIME_ZONE = "America/Sao_Paulo";
const LOCAL_TIME_ZONE_OFFSET = "-03:00";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: LOCAL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toLocalDateParts(date: Date): LocalDateParts {
  const [year, month, day] = localDateFormatter.format(date).split("-").map(Number);

  return { year, month, day };
}

export function startOfLocalDay(year: number, month: number, day: number): Date {
  const pad = (value: number) => String(value).padStart(2, "0");

  return new Date(`${year}-${pad(month)}-${pad(day)}T00:00:00${LOCAL_TIME_ZONE_OFFSET}`);
}

export function startOfLocalDate(date: Date): Date {
  const { year, month, day } = toLocalDateParts(date);

  return startOfLocalDay(year, month, day);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MS);
}
