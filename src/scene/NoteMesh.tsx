import { Text } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import type { Note } from "../types/domain";
import { useSpearAndSettle } from "./animation/useSpearAndSettle";
import { useTornAway } from "./animation/useTornAway";
import { NOTE_SIZE } from "./constants";
import { NOTE_CENTER_OFFSET, curledNoteGeometry } from "./geometry/curledNoteGeometry";
import type { NotePhase } from "./NotesStack";
import { computeNoteTransform } from "./transform/computeNoteTransform";

export function NoteMesh({
  note,
  phase,
  color,
  fontUrl,
  onEntered,
  onExited,
  onLanded,
}: {
  note: Note;
  phase: NotePhase;
  color: string;
  fontUrl: string;
  onEntered: () => void;
  onExited: () => void;
  onLanded?: () => void;
}) {
  const groupRef = useRef<Group>(null);

  const { position, quaternion } = useMemo(
    () => computeNoteTransform(note.id, note.stack_position),
    [note.id, note.stack_position],
  );

  useLayoutEffect(() => {
    if (phase !== "idle") return;
    const group = groupRef.current;
    if (!group) return;
    group.position.copy(position);
    group.quaternion.copy(quaternion);
    group.scale.setScalar(1);
  }, [phase, position, quaternion]);

  useSpearAndSettle({
    groupRef,
    active: phase === "entering",
    finalPosition: position,
    finalQuaternion: quaternion,
    onLanded,
    onComplete: onEntered,
  });

  useTornAway({
    groupRef,
    active: phase === "exiting",
    finalPosition: position,
    finalQuaternion: quaternion,
    onComplete: onExited,
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={curledNoteGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.88} metalness={0} side={DoubleSide} />
      </mesh>
      <Text
        position={[NOTE_CENTER_OFFSET, 0.007, -NOTE_CENTER_OFFSET]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.052}
        maxWidth={NOTE_SIZE * 0.8}
        lineHeight={1.15}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#2a2a2a"
        font={fontUrl}
      >
        {note.text}
      </Text>
    </group>
  );
}
