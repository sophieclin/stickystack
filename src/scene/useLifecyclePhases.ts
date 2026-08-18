import { useEffect, useRef, useState } from "react";

export type LifecyclePhase = "entering" | "idle" | "exiting";

export interface TrackedItem<T> {
  item: T;
  phase: LifecyclePhase;
  /** Rank within the pile/jar (0 = first), frozen once exiting so its animation doesn't jump. */
  index: number;
}

/**
 * Diffs an incoming list of `{id}`-bearing items against previously tracked ones every
 * render: new ids become `"entering"` (or `"idle"` on first mount, so the initial
 * contents don't animate in), ids no longer present become `"exiting"` (not deleted —
 * removed once the caller reports the exit animation finished via `handleExited`).
 * Shared by NotesStack (spike pile) and StarsStack (jar) — see NotesStack.tsx's
 * original comment on why `index` is array position, not any persisted ordering column.
 */
export function useLifecyclePhases<T extends { id: string }>(items: T[], isLoading: boolean) {
  const [tracked, setTracked] = useState<Map<string, TrackedItem<T>>>(new Map());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    setTracked((prev) => {
      const next = new Map(prev);
      const incomingIds = new Set(items.map((it) => it.id));

      items.forEach((item, index) => {
        const existing = next.get(item.id);
        if (!existing) {
          next.set(item.id, { item, phase: hasInitialized.current ? "entering" : "idle", index });
        } else if (existing.phase !== "exiting") {
          next.set(item.id, { item, phase: existing.phase, index });
        }
      });

      for (const [id, entry] of next) {
        if (!incomingIds.has(id) && entry.phase !== "exiting") {
          next.set(id, { item: entry.item, phase: "exiting", index: entry.index });
        }
      }

      return next;
    });

    hasInitialized.current = true;
  }, [items, isLoading]);

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

  return { tracked, handleEntered, handleExited };
}
