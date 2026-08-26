import { useLayoutEffect, useMemo, useRef } from "react";
import { Vector3, type Group } from "three";
import type { LifecyclePhase } from "./useLifecyclePhases";
import { useSpearAndSettle } from "./animation/useSpearAndSettle";
import { useTornAway } from "./animation/useTornAway";
import { HIGHLIGHT_EMISSIVE_COLOR, HIGHLIGHT_EMISSIVE_INTENSITY } from "./constants";
import { starGeometry } from "./geometry/starGeometry";
import { computeStarTransform } from "./transform/computeStarTransform";

// Pure vertical lift on exit — a star has no fan-rotation axis to pull away
// along the way a speared note does, so it just pops straight up and shrinks.
const POP_UP = new Vector3(0, 0, 0);

export function StarMesh({
  id,
  phase,
  jarIndex,
  color,
  isHighlighted,
  onEntered,
  onExited,
  onLanded,
}: {
  id: string;
  phase: LifecyclePhase;
  jarIndex: number;
  color: string;
  isHighlighted: boolean;
  onEntered: () => void;
  onExited: () => void;
  onLanded?: () => void;
}) {
  const groupRef = useRef<Group>(null);

  const { position, quaternion, scale } = useMemo(
    () => computeStarTransform(id, jarIndex),
    [id, jarIndex],
  );

  useLayoutEffect(() => {
    if (phase !== "idle") return;
    const group = groupRef.current;
    if (!group) return;
    group.position.copy(position);
    group.quaternion.copy(quaternion);
    group.scale.setScalar(scale);
  }, [phase, position, quaternion, scale]);

  useSpearAndSettle({
    groupRef,
    active: phase === "entering",
    finalPosition: position,
    finalQuaternion: quaternion,
    finalScale: scale,
    onLanded,
    onComplete: onEntered,
  });

  useTornAway({
    groupRef,
    active: phase === "exiting",
    finalPosition: position,
    finalQuaternion: quaternion,
    finalScale: scale,
    outward: POP_UP,
    onComplete: onExited,
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={starGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.4}
          emissive={isHighlighted ? HIGHLIGHT_EMISSIVE_COLOR : "#000000"}
          emissiveIntensity={isHighlighted ? HIGHLIGHT_EMISSIVE_INTENSITY : 0}
        />
      </mesh>
    </group>
  );
}
