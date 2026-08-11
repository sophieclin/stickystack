import type { Note, Week } from "../../types/domain";

export function NoteListPanel({
  notes,
  weeksById,
  onComplete,
}: {
  notes: Note[];
  weeksById: Map<string, Week>;
  onComplete: (noteId: string) => void;
}) {
  if (notes.length === 0) {
    return <p className="note-list-empty">No active tasks yet — spike your first one above.</p>;
  }

  return (
    <ul className="note-list">
      {notes
        .slice()
        .sort((a, b) => b.stack_position - a.stack_position)
        .map((note) => (
          <li key={note.id} className="note-list-item">
            <span
              className="note-list-swatch"
              style={{ backgroundColor: weeksById.get(note.week_id)?.color ?? "#ccc" }}
            />
            <span className="note-list-text">{note.text}</span>
            <button type="button" onClick={() => onComplete(note.id)} aria-label="Complete task">
              ✓
            </button>
          </li>
        ))}
    </ul>
  );
}
