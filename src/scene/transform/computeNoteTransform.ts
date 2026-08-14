import { Quaternion, Vector3 } from "three";
import { seededRandom } from "../../lib/rng";
import { NOTE_HEIGHT_JITTER, NOTE_HEIGHT_STEP, SPIKE_HEIGHT, SPIKE_ORIGIN_Y } from "../constants";

const GOLDEN_ANGLE_DEG = 137.50776;
const Y_AXIS = new Vector3(0, 1, 0);
const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

// Notes near the spike's tip shrink by up to this fraction, so a tall pile
// tapers into a rough pyramid instead of reading as stacked equal-width disks.
const TAPER_AMOUNT = 0.35;

export interface NoteTransform {
  position: Vector3;
  quaternion: Quaternion;
  scale: number;
}

/**
 * Pure function of (id, pileIndex): always produces the same placement for
 * the same note, so reloading the page reproduces the exact same layout with
 * no persisted transform data. `pileIndex` is the note's rank within its own
 * pile (0 = bottom) — not `note.stack_position`, which is a database
 * identity shared across every user's notes and would leave gaps that float
 * a pile off the base.
 */
export function computeNoteTransform(id: string, pileIndex: number): NoteTransform {
  const rand = seededRandom(id);

  // Every note is pierced through its own center, directly above the one
  // below it, so there's nothing to spatially distribute — instead each
  // note is turned to a new golden-angle offset as it's speared, plus a
  // slight seeded wobble, so the pile reads as a stack of individually
  // twisted sheets rather than a single frozen orientation repeated upward.
  const baseAngleDeg = (pileIndex * GOLDEN_ANGLE_DEG) % 360;
  const angleDeg = baseAngleDeg + (rand() - 0.5) * 14;
  const angleRad = (angleDeg * Math.PI) / 180;

  const y = SPIKE_ORIGIN_Y + pileIndex * NOTE_HEIGHT_STEP + (rand() - 0.5) * NOTE_HEIGHT_JITTER;
  const position = new Vector3(0, y, 0);

  const tiltX = (rand() - 0.5) * 0.05;
  const tiltZ = (rand() - 0.5) * 0.05;

  const qFan = new Quaternion().setFromAxisAngle(Y_AXIS, angleRad);
  const qTilt = new Quaternion()
    .setFromAxisAngle(X_AXIS, tiltX)
    .multiply(new Quaternion().setFromAxisAngle(Z_AXIS, tiltZ));
  const quaternion = qFan.multiply(qTilt);

  const heightFraction = Math.min(Math.max((y - SPIKE_ORIGIN_Y) / SPIKE_HEIGHT, 0), 1);
  const scale = 1 - heightFraction * TAPER_AMOUNT;

  return { position, quaternion, scale };
}
