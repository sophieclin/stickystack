import { useLayoutEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BackSide, Vector3, type Group } from "three";
import type { LifecyclePhase } from "./useLifecyclePhases";
import { useSpearAndSettle } from "./animation/useSpearAndSettle";
import { useTornAway } from "./animation/useTornAway";
import { HIGHLIGHT_GLOW_COLOR, HIGHLIGHT_GLOW_OPACITY, HIGHLIGHT_GLOW_SCALE } from "./constants";
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
      {isHighlighted && (
        // renderOrder forces this to draw after the jar's glass (Jar.tsx, default
        // renderOrder 0). depthTest={false} is the part that actually matters here,
        // though: Jar.tsx's glass material never sets depthWrite={false}, so despite
        // being transparent it still writes to the depth buffer — a star viewed
        // through the glass fails the depth test against that and gets silently
        // discarded. Skipping the depth test lets the glow read through the glass
        // the way a highlight indicator should, at the cost of also reading through
        // any genuinely nearer opaque object — an acceptable trade for a "make this
        // easy to spot" effect.
        <mesh geometry={starGeometry} scale={HIGHLIGHT_GLOW_SCALE} renderOrder={1}>
          <meshBasicMaterial
            color={HIGHLIGHT_GLOW_COLOR}
            side={BackSide}
            transparent
            opacity={HIGHLIGHT_GLOW_OPACITY}
            blending={AdditiveBlending}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      )}
      <mesh geometry={starGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
      </mesh>
    </group>
  );
}
