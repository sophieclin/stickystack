import { format, isBefore, parseISO, startOfWeek, subMonths } from "date-fns";

/** Monday of the current week, as a yyyy-MM-dd date string (local time). */
export function getCurrentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

/** True if a week whose Monday is `weekStartDate` is older than `archiveMonths`. */
export function isWeekArchived(weekStartDate: string, archiveMonths: number): boolean {
  const cutoff = subMonths(new Date(), archiveMonths);
  return isBefore(parseISO(weekStartDate), cutoff);
}
