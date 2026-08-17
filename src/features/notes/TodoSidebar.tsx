import { useMemo, useState } from "react";
import type { Note, Week } from "../../types/domain";
import { TodoNoteTile } from "./TodoNoteTile";

export function TodoSidebar({
  notes,
  weeksById,
  disabled,
  selectedId,
  onSelect,
  onAdd,
  addDisabled,
  onTextChange,
  onMarkDone,
  onDelete,
}: {
  notes: Note[];
  weeksById: Map<string, Week>;
  disabled: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  addDisabled: boolean;
  onTextChange: (id: string, text: string) => void;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.text.toLowerCase().includes(q));
  }, [notes, query]);

  return (
    <aside className="todo-sidebar">
      <div className="todo-sidebar-header">
        <h2>To-Do</h2>
        <button type="button" className="todo-add-button" disabled={addDisabled} onClick={onAdd}>
          + Add
        </button>
      </div>

      {notes.length > 0 && (
        <input
          type="text"
          className="todo-search"
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {notes.length === 0 ? (
        <p className="todo-empty">
          {disabled ? "Pick a color for this week first" : "No tasks yet — add one above"}
        </p>
      ) : filteredNotes.length === 0 ? (
        <p className="todo-empty">No matches</p>
      ) : (
        <div className="todo-grid">
          {filteredNotes.map((note) => (
            <TodoNoteTile
              key={note.id}
              text={note.text}
              color={weeksById.get(note.week_id)?.color ?? "#cccccc"}
              isSelected={selectedId === note.id}
              onSelect={() => onSelect(note.id)}
              onTextChange={(text) => onTextChange(note.id, text)}
              onMarkDone={() => {
                onMarkDone(note.id);
                onSelect(null);
              }}
              onDelete={() => {
                onDelete(note.id);
                onSelect(null);
              }}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
