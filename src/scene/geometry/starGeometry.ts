import { ExtrudeGeometry, Shape } from "three";
import { STAR_SIZE, STAR_THICKNESS } from "../jarConstants";

const POINTS = 5;
// Chunkier than a classic sharp star (same proportions as the CSS star shape
// used in hidden mode's 2D UI, see index.css's --star-shape) — reads clearly
// as a star at this scale without vanishing to slivers at the points.
const INNER_RATIO = 0.5;
// How much extra thickness the star's center puffs up by, tapering to none
// at the outer point tips — gives it the plump, pillowy look of a folded
// paper star instead of a flat faceted chip.
const PUFF_AMOUNT = STAR_SIZE * 0.55;

/**
 * A small extruded 5-point star with a puffed center. Built once at module
 * scope and shared by every star mesh, since every star is the same shape
 * (only color/scale/orientation vary per instance).
 */
function buildStarGeometry() {
  const shape = new Shape();
  const step = Math.PI / POINTS;

  for (let i = 0; i < POINTS * 2; i++) {
    const radius = i % 2 === 0 ? STAR_SIZE : STAR_SIZE * INNER_RATIO;
    const angle = i * step - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: STAR_THICKNESS,
    bevelEnabled: true,
    bevelThickness: STAR_THICKNESS * 0.25,
    bevelSize: STAR_THICKNESS * 0.15,
    bevelSegments: 2,
  });
  geometry.center();
  puffCenter(geometry);

  // Lay the star flat (its extrusion depth becomes the vertical axis) so it
  // rests like a coin/medallion instead of standing on edge — see
  // computeStarTransform, which relies on this to keep placement's vertical
  // extent small and predictable (mostly just its thickness, not up to the
  // full STAR_SIZE a fully tumbled star could reach).
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Pushes each vertex further from the star's mid-plane the closer its (x, y)
 * is to the center, tapering to no extra push at the outer point tips —
 * turns the flat extruded chip into a plump, pillow-like star. Works on the
 * front/back cap and bevel/wall vertices alike since it's purely a function
 * of each vertex's own (x, y, z), not which part of the extrusion it came
 * from.
 */
function puffCenter(geometry: ExtrudeGeometry) {
  const position = geometry.attributes.position;
  let maxAbsZ = 0;
  for (let i = 0; i < position.count; i++) {
    maxAbsZ = Math.max(maxAbsZ, Math.abs(position.getZ(i)));
  }
  if (maxAbsZ === 0) return;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const radialFactor = Math.max(0, 1 - Math.hypot(x, y) / STAR_SIZE);
    const zFraction = z / maxAbsZ;
    position.setZ(i, z + PUFF_AMOUNT * radialFactor * zFraction);
  }
  position.needsUpdate = true;
}

export const starGeometry = buildStarGeometry();
