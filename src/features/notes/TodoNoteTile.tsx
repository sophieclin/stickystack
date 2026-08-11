import { useEffect, useRef, useState } from "react";

export function TodoNoteTile({
  text,
  color,
  isSelected,
  onSelect,
  onTextChange,
  onMarkDone,
}: {
  text: string;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  onMarkDone: () => void;
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

  return (
    <div
      className={`todo-tile${isSelected ? " todo-tile--selected" : ""}`}
      style={{ backgroundColor: color }}
      onClick={onSelect}
    >
      <textarea
        ref={textareaRef}
        className="todo-tile-text"
        value={localText}
        maxLength={280}
        onChange={(e) => setLocalText(e.target.value)}
        onFocus={onSelect}
        onBlur={commit}
      />
      {isSelected && (
        <button
          type="button"
          className="todo-tile-done"
          onClick={(e) => {
            e.stopPropagation();
            commit();
            onMarkDone();
          }}
        >
          ✓ Done
        </button>
      )}
    </div>
  );
}
