import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react";

const BULLET = "• ";

function lineStartIndex(value: string, cursor: number) {
  return value.lastIndexOf("\n", cursor - 1) + 1;
}

export function TodoNoteTile({
  text,
  color,
  isSelected,
  isHighlighted,
  onSelect,
  onTextChange,
  onMarkDone,
  onDelete,
  onToggleHighlight,
}: {
  text: string;
  color: string;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  onMarkDone: (text: string) => void;
  onDelete: () => void;
  onToggleHighlight: () => void;
}) {
  const [localText, setLocalText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    if (isSelected) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isSelected]);

  function commit() {
    const trimmed = localText.trim();
    if (trimmed && trimmed !== text) {
      onTextChange(trimmed);
    } else if (!trimmed) {
      setLocalText(text);
    }
  }

  // Typing "- " or "* " at the start of a line converts it into a bullet.
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const textarea = e.target;
    const value = textarea.value;
    const cursor = textarea.selectionStart;
    const lineStart = lineStartIndex(value, cursor);
    const currentLine = value.slice(lineStart, cursor);

    if (currentLine === "- " || currentLine === "* ") {
      const next = value.slice(0, lineStart) + BULLET + value.slice(cursor);
      const nextCursor = lineStart + BULLET.length;
      setLocalText(next);
      requestAnimationFrame(() => textarea.setSelectionRange(nextCursor, nextCursor));
      return;
    }

    setLocalText(value);
  }

  // Enter on a bulleted line continues the list; Enter on an empty bullet exits it.
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;
    const textarea = e.currentTarget;
    const value = textarea.value;
    const cursor = textarea.selectionStart;
    const lineStart = lineStartIndex(value, cursor);
    const currentLine = value.slice(lineStart, cursor);

    if (currentLine === BULLET) {
      e.preventDefault();
      const next = value.slice(0, lineStart) + value.slice(cursor);
      setLocalText(next);
      requestAnimationFrame(() => textarea.setSelectionRange(lineStart, lineStart));
      return;
    }

    if (currentLine.startsWith(BULLET)) {
      e.preventDefault();
      const insert = `\n${BULLET}`;
      const next = value.slice(0, cursor) + insert + value.slice(cursor);
      const nextCursor = cursor + insert.length;
      setLocalText(next);
      requestAnimationFrame(() => textarea.setSelectionRange(nextCursor, nextCursor));
    }
  }

  return (
    <div
      className={`todo-tile${isSelected ? " todo-tile--selected" : ""}${isHighlighted ? " todo-tile--highlighted" : ""}`}
      style={{ "--tile-color": color } as CSSProperties}
      onClick={onSelect}
    >
      <textarea
        ref={textareaRef}
        className="todo-tile-text"
        value={localText}
        maxLength={280}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onSelect}
        onBlur={commit}
      />
      {isSelected && (
        <>
          <button
            type="button"
            className={`todo-tile-highlight${isHighlighted ? " todo-tile-highlight--active" : ""}`}
            title={isHighlighted ? "Remove highlight" : "Highlight task"}
            aria-label={isHighlighted ? "Remove highlight" : "Highlight task"}
            aria-pressed={isHighlighted}
            onClick={(e) => {
              e.stopPropagation();
              onToggleHighlight();
            }}
          >
            {isHighlighted ? "★" : "☆"}
          </button>
          <button
            type="button"
            className="todo-tile-delete"
            title="Delete task"
            aria-label="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete "${text}"? This can't be undone.`)) {
                onDelete();
              }
            }}
          />
          <button
            type="button"
            className="todo-tile-done"
            onClick={(e) => {
              e.stopPropagation();
              commit();
              onMarkDone(localText.trim() || text);
            }}
          >
            ✓ Done
          </button>
        </>
      )}
    </div>
  );
}
