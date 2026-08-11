import { PlaneGeometry } from "three";
import { NOTE_CURL_AMOUNT, NOTE_PIVOT_INSET, NOTE_SIZE } from "../constants";

/**
 * A square note plane whose local origin sits at the inset "pierced" corner
 * (rather than the plane's center), with the far corners displaced upward to
 * read as curling paper. Built once at module scope and shared by every note
 * mesh, since every note is the same shape.
 */
function buildCurledNoteGeometry() {
  const geometry = new PlaneGeometry(NOTE_SIZE, NOTE_SIZE, 4, 4);
  const position = geometry.attributes.position;

  const pivotX = -NOTE_SIZE / 2 + NOTE_PIVOT_INSET;
  const pivotY = -NOTE_SIZE / 2 + NOTE_PIVOT_INSET;
  const maxDist = Math.hypot(NOTE_SIZE - NOTE_PIVOT_INSET, NOTE_SIZE - NOTE_PIVOT_INSET);

  for (let i = 0; i < position.count; i++) {
    const dx = position.getX(i) - pivotX;
    const dy = position.getY(i) - pivotY;
    const t = Math.min(Math.hypot(dx, dy) / maxDist, 1);
    position.setZ(i, NOTE_CURL_AMOUNT * t * t);
  }
  position.needsUpdate = true;

  // Move the pivot corner to the local origin, then lay the plane flat
  // (normal +Y) so it fans out horizontally around the vertical spike.
  geometry.translate(-pivotX, -pivotY, 0);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();

  return geometry;
}

export const curledNoteGeometry = buildCurledNoteGeometry();

/** Offset from the pivot corner to the note's visual center, in the mesh's local (post-rotation) frame. */
export const NOTE_CENTER_OFFSET = (NOTE_SIZE - NOTE_PIVOT_INSET) / 2;
