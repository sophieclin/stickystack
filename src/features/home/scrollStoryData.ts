import type { Note, Week } from "../../types/domain";

export interface ScrollStoryPoint {
  id: string;
  color: string;
  heading: string;
  bullets: string[];
}

export const SCROLL_STORY_POINTS: ScrollStoryPoint[] = [
  {
    id: "point-finish",
    color: "#f4a259",
    heading: "Built to feel finished",
    bullets: ["One-click spike", "A satisfying spear animation", "A pile you can watch grow"],
  },
  {
    id: "point-color",
    color: "#6699cc",
    heading: "One color per week",
    bullets: ["Pick a color, start your week", "Every note keeps its color for good", "Scroll your pile, scroll your history"],
  },
  {
    id: "point-simple",
    color: "#84a98c",
    heading: "Nothing to configure",
    bullets: ["No projects or priorities to set up", "No monthly reset anxiety", "Old weeks quietly archive themselves"],
  },
  {
    id: "point-real",
    color: "#b298dc",
    heading: "A real 3D object",
    bullets: ["Reload-safe, deterministic layout", "Drag to spin and inspect", "Sitting right on your desk"],
  },
];

const NOW = new Date().toISOString();

const SCROLL_WEEKS: Week[] = SCROLL_STORY_POINTS.map((point) => ({
  id: `week-${point.id}`,
  user_id: "demo-user",
  start_date: NOW.slice(0, 10),
  color: point.color,
  created_at: NOW,
}));

export const SCROLL_WEEKS_BY_ID = new Map<string, Week>(SCROLL_WEEKS.map((w) => [w.id, w]));

export function pointToNote(point: ScrollStoryPoint, pileIndex: number): Note {
  return {
    id: point.id,
    user_id: "demo-user",
    week_id: `week-${point.id}`,
    text: point.heading,
    status: "done",
    stack_position: pileIndex,
    created_at: NOW,
    completed_at: NOW,
    is_highlighted: false,
  };
}
