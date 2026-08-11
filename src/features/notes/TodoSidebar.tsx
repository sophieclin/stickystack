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
}) {
  return (
    <aside className="todo-sidebar">
      <div className="todo-sidebar-header">
        <h2>To-Do</h2>
        <button type="button" className="todo-add-button" disabled={addDisabled} onClick={onAdd}>
          + Add
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="todo-empty">
          {disabled ? "Pick a color for this week first" : "No tasks yet — add one above"}
        </p>
      ) : (
        <div className="todo-grid">
          {notes.map((note) => (
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
            />
          ))}
        </div>
      )}
    </aside>
  );
}
