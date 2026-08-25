import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StreakHeatmap } from "../features/history/StreakHeatmap";
import { computeCompletionStats } from "../lib/completionStats";
import { useCompletionHistory } from "../hooks/useCompletionHistory";
import { useUncompleteNote } from "../hooks/useUncompleteNote";
import { useWeeks } from "../hooks/useWeeks";
import { supabase } from "../lib/supabaseClient";

export function HistoryPage() {
  const { notes, isLoading } = useCompletionHistory();
  const weeksQuery = useWeeks();
  const uncompleteNote = useUncompleteNote();
  const [query, setQuery] = useState("");

  const weeksById = useMemo(
    () => new Map(weeksQuery.data?.map((w) => [w.id, w]) ?? []),
    [weeksQuery.data],
  );

  const stats = useMemo(() => computeCompletionStats(notes, weeksById), [notes, weeksById]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.text.toLowerCase().includes(q));
  }, [notes, query]);

  return (
    <div className="settings-page">
      <header className="stack-header">
        <h1>
          <Link to="/" className="stack-header-logo">
            StickyStack
          </Link>
        </h1>
        <div className="stack-header-right">
          <span className="stack-header-greeting">History</span>
          <Link to="/app">Back to stack</Link>
          <Link to="/settings">Settings</Link>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section>
            <h2>Stats</h2>
            <div className="history-stats">
              <div className="history-stat">
                <strong>{stats.total}</strong>
                <span>Total completed</span>
              </div>
              <div className="history-stat">
                <strong>{stats.thisWeek}</strong>
                <span>This week</span>
              </div>
              <div className="history-stat">
                <strong>{stats.thisMonth}</strong>
                <span>This month</span>
              </div>
              <div className="history-stat">
                <strong>{stats.streakDays}</strong>
                <span>Day streak</span>
              </div>
              <div className="history-stat">
                <strong>{stats.longestStreak}</strong>
                <span>Longest streak</span>
              </div>
              <div className="history-stat">
                <strong>{stats.busiestWeek?.count ?? "—"}</strong>
                <span>
                  Busiest week
                  {stats.busiestWeek && (
                    <span className="history-busiest-detail">
                      (
                      <span
                        className="history-week-dot"
                        style={{ backgroundColor: stats.busiestWeek.week.color ?? "#cccccc" }}
                      />
                      {format(new Date(stats.busiestWeek.week.start_date), "MMM d")})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2>Streak calendar</h2>
            <StreakHeatmap notes={notes} />
          </section>

          <section>
            <h2>Completed tasks</h2>
            <input
              type="text"
              className="history-search"
              placeholder="Search completed tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {filteredNotes.length === 0 ? (
              <p className="todo-empty">
                {notes.length === 0 ? "Nothing completed yet" : "No matches"}
              </p>
            ) : (
              <ul className="history-list">
                {filteredNotes.map((note) => (
                  <li key={note.id} className="history-row">
                    <span
                      className="history-week-dot"
                      style={{ backgroundColor: weeksById.get(note.week_id)?.color ?? "#cccccc" }}
                    />
                    <span className="history-row-text">{note.text}</span>
                    <span className="history-row-date">
                      {note.completed_at ? format(new Date(note.completed_at), "MMM d, yyyy") : ""}
                    </span>
                    <button
                      type="button"
                      className="history-row-undo"
                      disabled={uncompleteNote.isPending}
                      onClick={() => uncompleteNote.mutate(note.id)}
                    >
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
