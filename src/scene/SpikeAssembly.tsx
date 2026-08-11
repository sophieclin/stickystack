import { useRef } from "react";
import type { Group } from "three";
import type { Note, Week } from "../types/domain";
import { useStackImpulse } from "./animation/useStackImpulse";
import { Base } from "./Base";
import { NotesStack } from "./NotesStack";
import { Spike } from "./Spike";

export function SpikeAssembly({
  notes,
  isLoading,
  weeksById,
  fontUrl,
  onCompleteNote,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
  fontUrl: string;
  onCompleteNote: (id: string) => void;
}) {
  const groupRef = useRef<Group>(null);
  const triggerImpulse = useStackImpulse(groupRef);

  return (
    <group ref={groupRef}>
      <Base />
      <Spike />
      <NotesStack
        notes={notes}
        isLoading={isLoading}
        weeksById={weeksById}
        fontUrl={fontUrl}
        onNoteLanded={triggerImpulse}
        onCompleteNote={onCompleteNote}
      />
    </group>
  );
}
