import { eachDayOfInterval, format, parseISO, startOfDay, subMonths } from "date-fns";
import type { Note } from "../types/domain";

export type HeatmapDay = {
  date: string; // yyyy-MM-dd
  count: number;
};

/** One entry per day in the trailing `months`-month window ending today, zero-count days included. */
export function computeHeatmapDays(notes: Note[], months = 12): HeatmapDay[] {
  const today = startOfDay(new Date());
  const start = startOfDay(subMonths(today, months));

  const countByDate = new Map<string, number>();
  for (const note of notes) {
    if (!note.completed_at) continue;
    const key = format(parseISO(note.completed_at), "yyyy-MM-dd");
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  }

  return eachDayOfInterval({ start, end: today }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return { date: key, count: countByDate.get(key) ?? 0 };
  });
}

/** Maps a day's count to an intensity bucket (0 = none, 4 = darkest), relative to the window's max. */
export function computeIntensityBucket(count: number, maxCount: number): number {
  if (count === 0 || maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}
