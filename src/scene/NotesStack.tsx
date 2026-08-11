import { useEffect, useRef, useState } from "react";
import type { Note, Week } from "../types/domain";
import { NoteMesh } from "./NoteMesh";

export type NotePhase = "entering" | "idle" | "exiting";

interface TrackedNote {
  note: Note;
  phase: NotePhase;
}

export function NotesStack({
  notes,
  isLoading,
  weeksById,
  fontUrl,
  onNoteLanded,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  fontUrl: string;
  onNoteLanded?: () => void;
}) {
  const [tracked, setTracked] = useState<Map<string, TrackedNote>>(new Map());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    setTracked((prev) => {
      const next = new Map(prev);
      const incomingIds = new Set(notes.map((n) => n.id));

      for (const note of notes) {
        const existing = next.get(note.id);
        if (!existing) {
          next.set(note.id, { note, phase: hasInitialized.current ? "entering" : "idle" });
        } else if (existing.phase !== "exiting") {
          next.set(note.id, { note, phase: existing.phase });
        }
      }

      for (const [id, entry] of next) {
        if (!incomingIds.has(id) && entry.phase !== "exiting") {
          next.set(id, { note: entry.note, phase: "exiting" });
        }
      }

      return next;
    });

    hasInitialized.current = true;
  }, [notes, isLoading]);

  function handleEntered(id: string) {
    setTracked((prev) => {
      const entry = prev.get(id);
      if (!entry) return prev;
      const next = new Map(prev);
      next.set(id, { ...entry, phase: "idle" });
      return next;
    });
  }

  function handleExited(id: string) {
    setTracked((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <>
      {Array.from(tracked.values()).map(({ note, phase }) => (
        <NoteMesh
          key={note.id}
          note={note}
          phase={phase}
          color={weeksById.get(note.week_id)?.color ?? "#cccccc"}
          fontUrl={fontUrl}
          onEntered={() => handleEntered(note.id)}
          onExited={() => handleExited(note.id)}
          onLanded={onNoteLanded}
        />
      ))}
    </>
  );
}
