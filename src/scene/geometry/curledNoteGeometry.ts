import { PlaneGeometry } from "three";
import { NOTE_CURL_AMOUNT, NOTE_SIZE } from "../constants";

/**
 * A square note plane whose local origin sits at its center — the point the
 * spike pierces — with the corners displaced upward to read as paper curling
 * around the puncture. Built once at module scope and shared by every note
 * mesh, since every note is the same shape.
 */
function buildCurledNoteGeometry() {
  const geometry = new PlaneGeometry(NOTE_SIZE, NOTE_SIZE, 4, 4);
  const position = geometry.attributes.position;

  const maxDist = Math.hypot(NOTE_SIZE / 2, NOTE_SIZE / 2);

  for (let i = 0; i < position.count; i++) {
    const dx = position.getX(i);
    const dy = position.getY(i);
    const t = Math.min(Math.hypot(dx, dy) / maxDist, 1);
    position.setZ(i, NOTE_CURL_AMOUNT * t * t);
  }
  position.needsUpdate = true;

  // Lay the plane flat (normal +Y) so it sits horizontally, pierced through
  // its center by the vertical spike, and can be spun to a new angle each
  // time a note is speared without orbiting off-axis.
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();

  return geometry;
}

export const curledNoteGeometry = buildCurledNoteGeometry();
