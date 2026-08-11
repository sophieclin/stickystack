import { useState, type FormEvent } from "react";

export function AddNoteForm({
  disabled,
  submitting,
  onSubmit,
}: {
  disabled: boolean;
  submitting: boolean;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <form className="add-note-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={disabled ? "Pick a color for this week first…" : "Write a task…"}
        value={text}
        maxLength={280}
        disabled={disabled || submitting}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" disabled={disabled || submitting || !text.trim()}>
        Spike it
      </button>
    </form>
  );
}
