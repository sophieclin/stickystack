import { NOTE_HEIGHT_STEP, SPIKE_HEIGHT } from "../../scene/constants";
import { FONT_OPTIONS } from "../../lib/fonts";
import type { Note, Week } from "../../types/domain";

// Same palette offered in the real color picker (ColorPickerModal), oldest week
// at the bottom of the pile to newest at the top.
const WEEK_COLORS = ["#6699cc", "#84a98c", "#f6bd60", "#f2a6c9", "#f4a259", "#f25c54"];
const NOTES_PER_WEEK = 14;

// Fills most of the spike's height but leaves its tip bare, like a real
// receipt spike that isn't jammed all the way to the point.
const _fillCheck = (WEEK_COLORS.length * NOTES_PER_WEEK * NOTE_HEIGHT_STEP) / SPIKE_HEIGHT;
if (_fillCheck > 0.95) throw new Error("demo pile would overflow the spike tip — reduce NOTES_PER_WEEK");

const DEMO_TASK_TEXT = [
  "Ship the landing page",
  "Reply to client emails",
  "Write release notes",
  "Fix that one bug",
  "Plan next sprint",
  "Book team offsite",
  "Review pull requests",
  "Update the pricing page",
  "Onboard new hire",
  "Renew the domain",
  "Clean up the backlog",
  "Draft the newsletter",
  "Test the checkout flow",
  "Follow up with leads",
  "Refactor the auth flow",
  "Tidy the design system",
  "Record a demo video",
  "Write unit tests",
  "Push the hotfix",
  "Sketch new onboarding",
];

const DEMO_WEEKS: Week[] = WEEK_COLORS.map((color, w) => ({
  id: `demo-week-${w}`,
  user_id: "demo-user",
  start_date: `2026-${String(6 + w).padStart(2, "0")}-06`,
  color,
  created_at: "2026-08-10T00:00:00.000Z",
}));

export const DEMO_WEEKS_BY_ID = new Map<string, Week>(DEMO_WEEKS.map((w) => [w.id, w]));

export const DEMO_NOTES: Note[] = DEMO_WEEKS.flatMap((week, w) =>
  Array.from({ length: NOTES_PER_WEEK }, (_, i) => {
    const index = w * NOTES_PER_WEEK + i;
    return {
      id: `demo-note-${index}`,
      user_id: "demo-user",
      week_id: week.id,
      text: DEMO_TASK_TEXT[index % DEMO_TASK_TEXT.length],
      status: "done" as const,
      stack_position: index,
      created_at: week.created_at,
      completed_at: week.created_at,
    };
  }),
);

export const DEMO_FONT_URL = FONT_OPTIONS.caveat.meshFontUrl;
