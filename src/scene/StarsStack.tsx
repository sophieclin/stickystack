import type { Note, Week } from "../types/domain";
import { StarMesh } from "./StarMesh";
import { useLifecyclePhases } from "./useLifecyclePhases";

export function StarsStack({
  notes,
  isLoading,
  weeksById,
  onStarLanded,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  onStarLanded?: () => void;
}) {
  const { tracked, handleEntered, handleExited } = useLifecyclePhases(notes, isLoading);

  return (
    <>
      {Array.from(tracked.values()).map(({ item: note, phase, index: jarIndex }) => (
        <StarMesh
          key={note.id}
          id={note.id}
          phase={phase}
          jarIndex={jarIndex}
          color={weeksById.get(note.week_id)?.color ?? "#cccccc"}
          onEntered={() => handleEntered(note.id)}
          onExited={() => handleExited(note.id)}
          onLanded={onStarLanded}
        />
      ))}
    </>
  );
}
