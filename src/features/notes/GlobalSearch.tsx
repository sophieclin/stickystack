import { format } from "date-fns";
import { useMemo, useState, type FocusEvent } from "react";
import { useCompleteNote } from "../../hooks/useCompleteNote";
import { useSearchNotes } from "../../hooks/useSearchNotes";
import { useUncompleteNote } from "../../hooks/useUncompleteNote";
import { useUserSettings } from "../../hooks/useUserSettings";
import { useWeeks } from "../../hooks/useWeeks";
import { isWeekArchived } from "../../lib/dates";
import { HighlightOnlyToggle } from "./HighlightOnlyToggle";

export function GlobalSearch() {
  const { notes } = useSearchNotes();
  const weeksQuery = useWeeks();
  const { data: settings } = useUserSettings();
  const completeNote = useCompleteNote();
  const uncompleteNote = useUncompleteNote();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedOnly, setHighlightedOnly] = useState(false);

  const weeksById = useMemo(
    () => new Map(weeksQuery.data?.map((w) => [w.id, w]) ?? []),
    [weeksQuery.data],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return notes
      .filter((n) => n.text.toLowerCase().includes(q))
      .filter((n) => !highlightedOnly || n.is_highlighted)
      .slice(0, 20);
  }, [notes, query, highlightedOnly]);

  function handleBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  const showResults = open && query.trim() !== "";

  return (
    <div className="global-search" onBlur={handleBlur}>
      <input
        type="text"
        className="global-search-input"
        placeholder="Search all tasks…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") e.currentTarget.blur();
        }}
      />

      {showResults && (
        <div className="global-search-results">
          <div className="global-search-filter-row">
            <HighlightOnlyToggle active={highlightedOnly} onToggle={() => setHighlightedOnly((v) => !v)} />
          </div>
          {results.length === 0 ? (
            <p className="global-search-empty">No matches</p>
          ) : (
            results.map((note) => {
              const week = weeksById.get(note.week_id);
              const archived = week && settings ? isWeekArchived(week.start_date, settings.archive_months) : false;
              return (
                <div key={note.id} className="global-search-row">
                  <span
                    className="history-week-dot"
                    style={{ backgroundColor: week?.color ?? "#cccccc" }}
                  />
                  <span className="global-search-text">{note.text}</span>
                  <span className="global-search-meta">
                    {note.status === "done"
                      ? `Done ${note.completed_at ? format(new Date(note.completed_at), "MMM d") : ""}`
                      : "Active"}
                    {archived ? " · archived" : ""}
                  </span>
                  {note.status === "active" ? (
                    <button
                      type="button"
                      className="global-search-action"
                      title={archived ? "Mark done (won't appear on the spike — its week is archived)" : "Mark done"}
                      disabled={completeNote.isPending}
                      onClick={() => completeNote.mutate(note.id)}
                    >
                      ✓ Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="global-search-action"
                      disabled={uncompleteNote.isPending}
                      onClick={() => uncompleteNote.mutate(note.id)}
                    >
                      Undo
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
