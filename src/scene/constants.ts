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
// Neither mesh tints its real material — highlighting adds a separate, unlit glow
// layer instead, so the note/star's own color never changes.
export const HIGHLIGHT_GLOW_COLOR = "#ffd400";
export const HIGHLIGHT_GLOW_OPACITY = 0.4;

// NoteMesh: the note is a flat plane, so its glow is a scaled-up duplicate using
// glowRingTexture (an alpha ring, transparent at center and true outer edge) rather
// than a Fresnel shader — a flat plane's normal barely varies across its surface, so
// view-angle-driven glow would just brighten the whole face, not its edges.
export const NOTE_GLOW_SCALE = 1.35;
// Tiny offset behind the real note to avoid z-fighting with the glow ring — kept much
// smaller than NOTE_HEIGHT_STEP so it can only ever sit behind *this* note, never bleed
// into a different note lower in the pile.
export const NOTE_GLOW_Y_OFFSET = -0.002;

// StarMesh: the star is a real extruded volume (see starGeometry's bevel/puff), so its
// glow uses a Fresnel/rim shader driven by each fragment's own surface normal vs. the
// camera — unlike a flat plane, this reads as an edge glow from any viewing angle, not
// just from directly above. The shell mesh is scaled up by a hair only to keep it from
// z-fighting with the real star underneath, not to change how wide the glow reads.
export const STAR_GLOW_SHELL_SCALE = 1.03;
