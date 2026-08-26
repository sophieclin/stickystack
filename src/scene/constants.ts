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
export const HIGHLIGHT_EMISSIVE_COLOR = "#ffd400";
export const HIGHLIGHT_EMISSIVE_INTENSITY = 0.6;
