// Wider than the jar itself so the removed lid has somewhere to lean against
// the glass without hanging off the edge — see Jar.tsx.
export const JAR_BASE_RADIUS = 0.64;
export const JAR_BASE_HEIGHT = 0.05;

/** y of the jar's interior floor (where it meets the base it sits on). */
export const JAR_ORIGIN_Y = JAR_BASE_HEIGHT / 2;

export const JAR_RADIUS = 0.4;
export const JAR_WALL_THICKNESS = 0.025;
/** Interior fillable height, measured up from JAR_ORIGIN_Y. */
export const JAR_HEIGHT = 0.85;

// Sized so a handful of stars visibly fit across the jar's interior per layer.
export const STAR_SIZE = 0.085;
export const STAR_THICKNESS = STAR_SIZE * 0.35;
export const STARS_PER_LAYER = 7;
// Wider than a plain flat chip's spacing would need — the puffed center
// (see geometry/starGeometry.ts) is meaningfully thicker than the star's
// edges, so layers need more clearance to avoid visibly interpenetrating.
export const STAR_HEIGHT_STEP = 0.095;
export const STAR_HEIGHT_JITTER = 0.012;
/** Keeps star centers this far from JAR_RADIUS so they don't clip the glass. */
export const STAR_WALL_MARGIN = 0.07;

export const JAR_NECK_RADIUS = 0.24;
export const JAR_LID_HEIGHT = 0.09;

// Fractions of JAR_HEIGHT where the body starts curving into the shoulder,
// and where the neck itself begins — shared between Jar.tsx's profile and
// computeStarTransform's packing radius so the interior taper they assume
// can't drift out of sync with the glass shape actually drawn.
export const JAR_SHOULDER_START_FRACTION = 0.72;
export const JAR_NECK_START_FRACTION = 0.94;
