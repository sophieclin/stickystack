import { useMemo } from "react";
import { DoubleSide, Vector2 } from "three";
import {
  JAR_HEIGHT,
  JAR_LID_HEIGHT,
  JAR_NECK_RADIUS,
  JAR_NECK_START_FRACTION,
  JAR_ORIGIN_Y,
  JAR_RADIUS,
  JAR_SHOULDER_START_FRACTION,
  JAR_WALL_THICKNESS,
} from "./jarConstants";

/** Revolved around the Y axis to build the jar wall: straight body, a curved shoulder, a
 * narrower neck, and a slightly flared lip — a candy-jar silhouette rather than a plain tube. */
function buildJarProfile() {
  const bodyRadius = JAR_RADIUS + JAR_WALL_THICKNESS;
  const neckRadius = JAR_NECK_RADIUS + JAR_WALL_THICKNESS;
  const shoulderStart = JAR_HEIGHT * JAR_SHOULDER_START_FRACTION;
  const neckStart = JAR_HEIGHT * JAR_NECK_START_FRACTION;
  return [
    new Vector2(bodyRadius, 0),
    new Vector2(bodyRadius, shoulderStart),
    new Vector2(bodyRadius * 0.9, (shoulderStart + neckStart) / 2),
    new Vector2(neckRadius, neckStart),
    new Vector2(neckRadius, JAR_HEIGHT),
    new Vector2(neckRadius * 1.12, JAR_HEIGHT * 1.02),
  ];
}

const LID_OUTER_RADIUS = JAR_NECK_RADIUS * 1.15;
// Tipped over from upright (0) toward lying on its side (PI/2) — propped
// against the glass like a real lid set down beside an open jar, not lying
// fully flat.
const LID_LEAN_ANGLE = Math.PI * 0.4;
// At a steep lean, a short wide cylinder's vertical footprint is dominated
// by its radius swinging toward vertical, not its (small) height — so the
// center has to sit this far above the floor for the lowest rim point to
// just reach it, or the lid sinks into the base.
const LID_VERTICAL_HALF_EXTENT =
  LID_OUTER_RADIUS * Math.sin(LID_LEAN_ANGLE) + (JAR_LID_HEIGHT / 2) * Math.cos(LID_LEAN_ANGLE);

/**
 * The jar's glass wall (lathed, open-ended — no top/bottom caps, so stars
 * inside stay visible and the neck is genuinely hollow) plus its cork lid,
 * leaning against the jar's side rather than sealing the top — it reads as
 * "open, mid-fill" instead of stars somehow dropping through a closed lid.
 */
export function Jar() {
  const profile = useMemo(buildJarProfile, []);

  return (
    <>
      <group position={[0, JAR_ORIGIN_Y, 0]}>
        <mesh>
          <latheGeometry args={[profile, 48]} />
          <meshPhysicalMaterial
            color="#dff3ff"
            transparent
            opacity={0.28}
            roughness={0.05}
            metalness={0}
            transmission={0.9}
            thickness={JAR_WALL_THICKNESS}
            side={DoubleSide}
          />
        </mesh>
      </group>
      <mesh
        position={[
          JAR_RADIUS + JAR_WALL_THICKNESS + LID_OUTER_RADIUS * 0.45,
          JAR_ORIGIN_Y + LID_VERTICAL_HALF_EXTENT,
          JAR_RADIUS * 0.3,
        ]}
        rotation={[0, 0, -LID_LEAN_ANGLE]}
        castShadow
      >
        <cylinderGeometry args={[JAR_NECK_RADIUS * 1.08, LID_OUTER_RADIUS, JAR_LID_HEIGHT, 32]} />
        <meshStandardMaterial color="#c9a06a" roughness={0.9} metalness={0} />
      </mesh>
    </>
  );
}
