import { useNotesByStatus } from "./useNotesByStatus";

/** Completed tasks, speared onto the 3D spike as a record of what's done. */
export function useDoneNotes() {
  return useNotesByStatus("done");
}
