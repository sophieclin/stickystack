import { Suspense, useRef } from "react";
import type { Group } from "three";
import type { Note, Week } from "../types/domain";
import { useStackImpulse } from "./animation/useStackImpulse";
import { Jar } from "./Jar";
import { JarBase } from "./JarBase";
import { StarsStack } from "./StarsStack";

export function JarAssembly({
  notes,
  isLoading,
  weeksById,
}: {
  notes: Note[];
  isLoading: boolean;
  weeksById: Map<string, Week>;
}) {
  const groupRef = useRef<Group>(null);
  const triggerImpulse = useStackImpulse(groupRef);

  return (
    <group ref={groupRef}>
      <JarBase />
      <Suspense fallback={null}>
        <StarsStack
          notes={notes}
          isLoading={isLoading}
          weeksById={weeksById}
          onStarLanded={triggerImpulse}
        />
      </Suspense>
      <Jar />
    </group>
  );
}
