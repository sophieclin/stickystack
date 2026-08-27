export const BASE_RADIUS = 0.48;
export const BASE_HEIGHT = 0.12;
export const SPIKE_HEIGHT = 1.05;
export const SPIKE_BOTTOM_RADIUS = 0.03;
export const SPIKE_TOP_RADIUS = 0.008;

/** y of the spike's base (where it meets the tin lid). */
export const SPIKE_ORIGIN_Y = BASE_HEIGHT / 2;

// Sized to fill most of the base's footprint (BASE_RADIUS 0.48) without its
// corners poking past the round edge: half-diagonal = NOTE_SIZE / sqrt(2).
export const NOTE_SIZE = 0.66;
export const NOTE_HEIGHT_STEP = 0.008;
export const NOTE_HEIGHT_JITTER = 0.0025;
export const NOTE_CURL_AMOUNT = 0.035;

// Shared by NoteMesh and StarMesh so a highlighted note glows the same way
// regardless of visual mode. Matches the --accent yellow used elsewhere in the app.
// Rendered as a slightly larger, unlit duplicate of each mesh's own geometry rather
// than an emissive tint on the real material, so highlighting doesn't change the
// note/star's own color — it reads as light escaping around its edges instead.
export const HIGHLIGHT_GLOW_COLOR = "#ffd400";
export const HIGHLIGHT_GLOW_OPACITY = 0.4;
export const HIGHLIGHT_GLOW_SCALE = 1.35;
// NoteMesh only: the glow copy is a flat plane, not a closed volume, so it needs a
// tiny offset behind the real note (rather than a backface-outline trick) to avoid
// z-fighting. Kept much smaller than NOTE_HEIGHT_STEP so it never reads as sitting
// behind a *different* note lower in the pile — glowRingTexture (not this offset) is
// what keeps the glow off the real note's own face.
export const NOTE_GLOW_Y_OFFSET = -0.002;
