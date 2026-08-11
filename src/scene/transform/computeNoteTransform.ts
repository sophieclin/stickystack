import { Quaternion, Vector3 } from "three";
import { seededRandom } from "../../lib/rng";
import { NOTE_HEIGHT_JITTER, NOTE_HEIGHT_STEP, SPIKE_ORIGIN_Y } from "../constants";

const GOLDEN_ANGLE_DEG = 137.50776;
const Y_AXIS = new Vector3(0, 1, 0);
const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

export interface NoteTransform {
  position: Vector3;
  quaternion: Quaternion;
}

/**
 * Pure function of (id, stackPosition): always produces the same fan
 * placement for the same note, so reloading the page reproduces the exact
 * same layout with no persisted transform data.
 */
export function computeNoteTransform(id: string, stackPosition: number): NoteTransform {
  const rand = seededRandom(id);

  // Golden-angle spiral for even distribution around the spike, plus a
  // seeded wobble on top so it still reads as an organic, messy pile.
  const baseAngleDeg = (stackPosition * GOLDEN_ANGLE_DEG) % 360;
  const angleDeg = baseAngleDeg + (rand() - 0.5) * 40;
  const angleRad = (angleDeg * Math.PI) / 180;

  const y = SPIKE_ORIGIN_Y + stackPosition * NOTE_HEIGHT_STEP + (rand() - 0.5) * NOTE_HEIGHT_JITTER;
  const position = new Vector3(0, y, 0);

  const tiltX = (rand() - 0.5) * 0.12;
  const tiltZ = (rand() - 0.5) * 0.12;

  const qFan = new Quaternion().setFromAxisAngle(Y_AXIS, angleRad);
  const qTilt = new Quaternion()
    .setFromAxisAngle(X_AXIS, tiltX)
    .multiply(new Quaternion().setFromAxisAngle(Z_AXIS, tiltZ));
  const quaternion = qFan.multiply(qTilt);

  return { position, quaternion };
}
