import { useNotesByStatus } from "./useNotesByStatus";

/** Not-yet-done tasks, shown in the To-Do sidebar. */
export function useActiveNotes() {
  return useNotesByStatus("active");
}
