import { useEffect, useRef, useState } from "react";
import type { Note, Week } from "../types/domain";
import { NoteMesh } from "./NoteMesh";

export type NotePhase = "entering" | "idle" | "exiting";

interface TrackedNote {
  note: Note;
  phase: NotePhase;
  /**
   * Rank within this pile (0 = bottom), not `note.stack_position` — that
   * column is a global identity shared by every user's notes, so its raw
   * value has arbitrary gaps and would float a pile's first note high above
   * the base. Kept frozen once a note starts exiting so its animation
   * doesn't jump.
   */
  pileIndex: number;
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

      notes.forEach((note, pileIndex) => {
        const existing = next.get(note.id);
        if (!existing) {
          next.set(note.id, { note, phase: hasInitialized.current ? "entering" : "idle", pileIndex });
        } else if (existing.phase !== "exiting") {
          next.set(note.id, { note, phase: existing.phase, pileIndex });
        }
      });

      for (const [id, entry] of next) {
        if (!incomingIds.has(id) && entry.phase !== "exiting") {
          next.set(id, { note: entry.note, phase: "exiting", pileIndex: entry.pileIndex });
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
      {Array.from(tracked.values()).map(({ note, phase, pileIndex }) => (
        <NoteMesh
          key={note.id}
          note={note}
          phase={phase}
          pileIndex={pileIndex}
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
