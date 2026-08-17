import { differenceInCalendarDays, isSameMonth, isSameWeek, parseISO } from "date-fns";
import type { Note, Week } from "../types/domain";

export type CompletionStats = {
  total: number;
  thisWeek: number;
  thisMonth: number;
  streakDays: number;
  busiestWeek: { week: Week; count: number } | null;
};

/** Consecutive days (working back from today) with at least one completion. */
function computeStreakDays(completedDates: Date[]): number {
  const days = new Set(completedDates.map((d) => differenceInCalendarDays(new Date(), d)));
  let streak = 0;
  while (days.has(streak)) streak++;
  return streak;
}

export function computeCompletionStats(
  doneNotes: Note[],
  weeksById: Map<string, Week>,
): CompletionStats {
  const now = new Date();
  const completedDates = doneNotes
    .filter((n) => n.completed_at)
    .map((n) => parseISO(n.completed_at!));

  const countByWeekId = new Map<string, number>();
  for (const note of doneNotes) {
    countByWeekId.set(note.week_id, (countByWeekId.get(note.week_id) ?? 0) + 1);
  }

  let busiestWeek: CompletionStats["busiestWeek"] = null;
  for (const [weekId, count] of countByWeekId) {
    const week = weeksById.get(weekId);
    if (week && (!busiestWeek || count > busiestWeek.count)) {
      busiestWeek = { week, count };
    }
  }

  return {
    total: doneNotes.length,
    thisWeek: completedDates.filter((d) => isSameWeek(d, now, { weekStartsOn: 1 })).length,
    thisMonth: completedDates.filter((d) => isSameMonth(d, now)).length,
    streakDays: computeStreakDays(completedDates),
    busiestWeek,
  };
}
