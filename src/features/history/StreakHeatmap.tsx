import { format, getDay, parseISO } from "date-fns";
import { useMemo } from "react";
import { computeHeatmapDays, computeIntensityBucket, type HeatmapDay } from "../../lib/streakHeatmap";
import type { Note } from "../../types/domain";

const WEEKDAY_ROWS = 7; // Monday .. Sunday, matching this app's Monday-start week convention

function toColumns(days: HeatmapDay[]): (HeatmapDay | null)[][] {
  if (days.length === 0) return [];
  const mondayFirstDow = (getDay(parseISO(days[0].date)) + 6) % 7;
  const padded: (HeatmapDay | null)[] = [...Array(mondayFirstDow).fill(null), ...days];

  const columns: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += WEEKDAY_ROWS) {
    columns.push(padded.slice(i, i + WEEKDAY_ROWS));
  }
  return columns;
}

export function StreakHeatmap({ notes }: { notes: Note[] }) {
  const days = useMemo(() => computeHeatmapDays(notes), [notes]);
  const maxCount = useMemo(() => Math.max(0, ...days.map((d) => d.count)), [days]);
  const columns = useMemo(() => toColumns(days), [days]);

  return (
    <div className="streak-heatmap" role="img" aria-label="Completion heatmap for the last 12 months">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="streak-heatmap-column">
          {column.map((day, rowIndex) =>
            day ? (
              <div
                key={day.date}
                className={`streak-heatmap-cell streak-heatmap-cell--${computeIntensityBucket(day.count, maxCount)}`}
                title={`${format(parseISO(day.date), "MMM d, yyyy")}: ${day.count} completed`}
              />
            ) : (
              <div key={rowIndex} className="streak-heatmap-cell streak-heatmap-cell--empty" />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
