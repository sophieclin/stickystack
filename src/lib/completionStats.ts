import { differenceInCalendarDays, isSameMonth, isSameWeek, parseISO } from "date-fns";
import type { Note, Week } from "../types/domain";

export type CompletionStats = {
  total: number;
  thisWeek: number;
  thisMonth: number;
  streakDays: number;
  longestStreak: number;
  busiestWeek: { week: Week; count: number } | null;
};

function completedDatesOf(notes: Note[]): Date[] {
  return notes.filter((n) => n.completed_at).map((n) => parseISO(n.completed_at!));
}

/** Consecutive days (working back from today) with at least one completion. */
export function computeStreakDays(notes: Note[]): number {
  const days = new Set(completedDatesOf(notes).map((d) => differenceInCalendarDays(new Date(), d)));
  let streak = 0;
  while (days.has(streak)) streak++;
  return streak;
}

/** Longest-ever run of consecutive calendar days with at least one completion. */
function computeLongestStreak(notes: Note[]): number {
  const days = Array.from(new Set(completedDatesOf(notes).map((d) => d.getTime())))
    .sort((a, b) => a - b)
    .map((t) => new Date(t));

  let longest = 0;
  let current = 0;
  let prev: Date | null = null;
  for (const day of days) {
    current = prev && differenceInCalendarDays(day, prev) === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    prev = day;
  }
  return longest;
}

export function computeCompletionStats(
  doneNotes: Note[],
  weeksById: Map<string, Week>,
): CompletionStats {
  const now = new Date();
  const completedDates = completedDatesOf(doneNotes);

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
    streakDays: computeStreakDays(doneNotes),
    longestStreak: computeLongestStreak(doneNotes),
    busiestWeek,
  };
}
