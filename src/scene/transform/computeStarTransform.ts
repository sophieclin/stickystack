import { Quaternion, Vector3 } from "three";
import { seededRandom } from "../../lib/rng";
import {
  JAR_HEIGHT,
  JAR_NECK_RADIUS,
  JAR_NECK_START_FRACTION,
  JAR_ORIGIN_Y,
  JAR_RADIUS,
  JAR_SHOULDER_START_FRACTION,
  STAR_HEIGHT_JITTER,
  STAR_HEIGHT_STEP,
  STAR_SIZE,
  STAR_WALL_MARGIN,
  STARS_PER_LAYER,
} from "../jarConstants";

const GOLDEN_ANGLE_DEG = 137.50776;
// Rotates each layer's starting angle so successive layers don't stack into
// visible vertical columns.
const LAYER_ANGLE_OFFSET_DEG = 47;

const Y_AXIS = new Vector3(0, 1, 0);
const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

// Bounded resting tilt (radians) — enough to look casually dropped, not so
// much a star tips onto a point and pokes below the layer it's resting on.
// The star geometry itself is already laid flat (see starGeometry.ts), so
// this is on top of "flat," not instead of it.
const MAX_TILT_RAD = 0.4;

// Lifts the whole stack so even the bottom layer's centers clear the jar
// floor regardless of tilt. Bigger than a flat chip would need, since the
// puffed center (see geometry/starGeometry.ts) is meaningfully thicker than
// the star's edges.
const FLOOR_CLEARANCE = STAR_SIZE * 0.85;

export interface StarTransform {
  position: Vector3;
  quaternion: Quaternion;
  scale: number;
}

/**
 * The jar's interior narrows above the shoulder into the neck (see Jar.tsx's
 * profile) — mirrors that same taper so packing never places a star wider
 * than the glass actually is at that height once the jar fills past the
 * shoulder.
 */
function jarInteriorRadiusAt(heightInJar: number): number {
  const shoulderStart = JAR_HEIGHT * JAR_SHOULDER_START_FRACTION;
  const neckStart = JAR_HEIGHT * JAR_NECK_START_FRACTION;
  if (heightInJar <= shoulderStart) return JAR_RADIUS;
  if (heightInJar >= neckStart) return JAR_NECK_RADIUS;
  const t = (heightInJar - shoulderStart) / (neckStart - shoulderStart);
  return JAR_RADIUS + (JAR_NECK_RADIUS - JAR_RADIUS) * t;
}

/**
 * Pure function of (id, jarIndex): always produces the same placement for
 * the same star, so reloading the page reproduces the exact same layout with
 * no persisted transform data — same contract as computeNoteTransform.
 *
 * Unlike notes (fixed X/Z, skewered on one shared vertical axis — only their
 * rotation and height vary), stars need real X/Z placement bounded by the
 * jar's interior radius. Stars are packed in layers of STARS_PER_LAYER; a
 * layer fills outward from its center using a golden-angle spiral with the
 * radius driven by a square root (a sunflower/phyllotaxis packing — sqrt
 * gives even *area* density instead of bunching stars near the center),
 * before the next layer starts higher up.
 */
export function computeStarTransform(id: string, jarIndex: number): StarTransform {
  const rand = seededRandom(id);

  const layer = Math.floor(jarIndex / STARS_PER_LAYER);
  const indexInLayer = jarIndex % STARS_PER_LAYER;
  const heightInJar = FLOOR_CLEARANCE + layer * STAR_HEIGHT_STEP;

  const maxRadius = jarInteriorRadiusAt(heightInJar) - STAR_WALL_MARGIN;
  const radiusFraction = Math.sqrt((indexInLayer + 0.5) / STARS_PER_LAYER);
  const radius = maxRadius * radiusFraction + (rand() - 0.5) * maxRadius * 0.08;

  const angleDeg =
    indexInLayer * GOLDEN_ANGLE_DEG + layer * LAYER_ANGLE_OFFSET_DEG + (rand() - 0.5) * 20;
  const angleRad = (angleDeg * Math.PI) / 180;

  const x = Math.cos(angleRad) * radius;
  const z = Math.sin(angleRad) * radius;
  const y = JAR_ORIGIN_Y + heightInJar + (rand() - 0.5) * STAR_HEIGHT_JITTER;
  const position = new Vector3(x, y, z);

  // Resting mostly flat (the geometry itself is already laid flat — see
  // starGeometry.ts) with a random facing spin plus a bounded tilt, like a
  // star settled at rest in a jar rather than standing on a point.
  const spinRad = rand() * Math.PI * 2;
  const tiltX = (rand() - 0.5) * MAX_TILT_RAD;
  const tiltZ = (rand() - 0.5) * MAX_TILT_RAD;

  const qSpin = new Quaternion().setFromAxisAngle(Y_AXIS, spinRad);
  const qTilt = new Quaternion()
    .setFromAxisAngle(X_AXIS, tiltX)
    .multiply(new Quaternion().setFromAxisAngle(Z_AXIS, tiltZ));
  const quaternion = qSpin.multiply(qTilt);

  const scale = 0.85 + rand() * 0.3;

  return { position, quaternion, scale };
}
