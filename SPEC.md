# SPEC: Daily Streak & Highlighted Notes

## Objective

Two independent additions to StickyStack:

1. **Streak**: show the user's current daily-completion streak somewhere they'll actually see it
   day to day, not buried on the History page — plus a heatmap calendar and longest-ever-streak
   stat on the History page for the longer view.
2. **Highlighted notes**: let a user mark any note (to-do or already-completed) as highlighted,
   and make that visible as a glow in the 3D stack, whichever visual mode (spike or star jar)
   they're using.

## Decisions locked in with the user

- **Streak basis**: daily — the streak counts consecutive calendar days (working back from
  today) with at least one completed task. If nothing has been marked done yet today, the
  streak is 0 even if yesterday was completed (matches the existing strict definition below,
  not a "grace period until midnight" definition).
- **Streak display**: a small persistent badge in the header/nav.
- **Streak heatmap**: on the History page, a GitHub-style contribution heatmap — a grid of the
  last ~12 months, one cell per day, colored by that day's completion count (darker/more
  saturated yellow = more completions that day, not just a binary "streaked or not"). Sits
  alongside the existing stat tiles rather than a new page or popover.
- **Longest streak**: a new "Longest streak" stat, computed over the user's *entire* completion
  history (not just the visible 12-month heatmap window) — the longest run of consecutive
  calendar days with at least one completion, ever.
- **Highlight scope**: available on both active (to-do) and done notes; the flag persists
  through a note's whole lifecycle (staying highlighted after it's speared onto the stack).
- **Highlight look in the 3D stack**: an emissive glow/outline on the note mesh itself — no
  color swap, no badge icon, no animation/pulsing.
- **Naming**: "star" is already taken in this codebase (`UserSettings.visual_mode = "stars"`,
  `StarMesh`, `StarsStack`, `JarScene` — the alternate jar-of-glowing-stars rendering). To avoid
  colliding with that concept, this feature is called **"highlight"** everywhere — UI copy, DB
  column (`is_highlighted`), hooks, component/prop names. Nothing here touches the existing
  star-jar visual mode's meaning.

## Grounding: a streak calculation already exists

`src/lib/completionStats.ts`'s `computeCompletionStats` already computes `streakDays` (private
helper `computeStreakDays`), consumed today only by `HistoryPage.tsx`'s "Day streak" stat tile.
Its definition (`differenceInCalendarDays` from today, walking back while consecutive days are
present in the completed-dates set) is exactly the daily/strict definition above. **This feature
is mostly "surface an existing calculation in a new place," not new streak logic** — the only
code change to the calculation itself is exporting the day-counting helper so it can be reused
without needing a full `CompletionStats` object (see Client architecture).

## Core features & acceptance criteria

### 1. Streak badge

- A small badge in `StackPage`'s header (next to History/Friends/Settings), showing the current
  day streak, e.g. "🔥 5".
- Uses the same data source and definition as `HistoryPage`'s existing "Day streak" stat —
  completions across **all** notes regardless of week-archive status (`useCompletionHistory`,
  not `useDoneNotes`), so the number never disagrees with History.
- Streak of 0 still renders the badge (not hidden) so the app doesn't look broken on day one —
  the fire icon renders grayscale (e.g. CSS `filter: grayscale(1)`) at streak 0 and full color
  once streak ≥ 1, giving an at-a-glance "streak alive vs. not" signal without extra copy.
- **Scope**: `StackPage` only, not `HistoryPage`/`FriendsPage`/`SettingsPage` headers.
  *(Assumption — those pages don't share a `Header` component today, so adding it everywhere
  would mean touching four files for a "nice to have"; flag if you want it broader.)*

### 2. Streak heatmap & longest streak

- New section on `HistoryPage`, near the existing "Stats" tiles.
- **Heatmap**: 53-ish columns × 7 rows (weeks × weekdays), last ~12 months, one cell per
  calendar day. Cell color intensity is bucketed from that day's completion count relative to
  the max day-count currently in view (quartile-style buckets, the same shape as GitHub's
  contribution graph) — 0 completions renders as a neutral empty cell (no yellow), and the
  darkest bucket is reserved for the user's own busiest day(s) in the window, so the gradient is
  meaningful whether someone completes 1 task/day or 15.
- Hovering/focusing a cell shows the date and count (a native `title` attribute is enough —
  no custom tooltip component needed).
- **Longest streak stat**: a new tile (same style as `Total completed` / `Day streak` /
  `Busiest week`) showing the longest-ever consecutive-day run, computed independently of the
  current streak (a broken streak from three months ago can still be the longest-ever one).
- Empty cells before the account existed are just empty — no special-casing needed, since a day
  with zero notes already renders as the neutral empty cell.

### 3. Highlighting a note

- To-do sidebar tile (`TodoNoteTile`): a toggle control to highlight/un-highlight, plus a
  persistent visual indicator (e.g. a colored ring) so highlighted state is visible in the grid
  without selecting the tile.
- History page row (`HistoryPage`'s completed-notes list): the same toggle, next to the existing
  "Undo" button — this is the only list-form UI a *done* note has (it otherwise only exists as a
  3D mesh), so it's the toggle point for already-completed notes.
- Toggling is optimistic-free (follows this repo's existing invalidate-on-success pattern, no
  new caching approach).
- **Out of scope for the toggle control**: clicking/tapping the note mesh directly in the 3D
  scene. That would need raycasting/pointer-event wiring in `NotesStack`/`StarsStack` that
  doesn't exist today — a materially bigger change than this feature warrants.
  *(Assumption — flag if in-scene toggling was the point.)*

### 4. Highlight rendering in the 3D stack

- `NoteMesh` (spike/notes visual mode): highlighted notes get an emissive glow on the existing
  `meshStandardMaterial`, layered on top of the note's normal week color — the base color never
  changes.
- `StarMesh` (star-jar visual mode): same treatment, so the feature behaves identically
  regardless of which `visual_mode` the user has picked. *(Assumption — you only mentioned "the
  stack," which could mean spike mode specifically; doing both keeps the two visual modes
  feature-equivalent, consistent with how every other per-note feature in this app already
  works identically in both modes.)*
- No change to `computeNoteTransform`/`computeStarTransform` (placement is untouched — highlight
  is a material-only change, not a layout change).

## Data model (Postgres / Supabase)

- Migration `0007_add_note_highlight.sql`: `alter table public.notes add column is_highlighted
  boolean not null default false;`
- **No RLS change** — the existing "update own notes" policy (`auth.uid() = user_id`) already
  permits updating any column on a caller's own note, including a new one.
- **No new table, no new RPC** — unlike Friends, this never touches another user's row.

## Client architecture

- `types/domain.ts`: add `is_highlighted: boolean` to `Note`.
- `types/database.types.ts`: add `is_highlighted?: boolean` to the `notes.Update` shape (`Row`
  already covers it via the `Note` type alias).
- `lib/completionStats.ts`: export the day-counting helper (rename/export
  `computeStreakDays`, changed to accept `Note[]` directly like the rest of this module's public
  surface, rather than a pre-mapped `Date[]`) so both `computeCompletionStats` and the new header
  badge can call it without duplicating the date-parsing logic. Add `longestStreak` to
  `CompletionStats` (max consecutive-run length over the full sorted set of completion days —
  same "consecutive calendar days" building block as `computeStreakDays`, just scanning forward
  over history instead of walking back from today).
- New `lib/streakHeatmap.ts`: `computeHeatmapDays(notes: Note[], months = 12): { date: string;
  count: number }[]` — one entry per day in the window (including zero-count days, so the grid
  component doesn't need to backfill gaps itself) — plus a small bucketing helper that turns a
  count into an intensity level (0–4) given the window's max count.
- New `features/history/StreakHeatmap.tsx`: pure presentational grid component consuming
  `computeHeatmapDays`'s output, mounted on `HistoryPage`.
- New hook `useToggleHighlight()`: mirrors `useCompleteNote`'s shape — mutation takes `{ id,
  isHighlighted }`, updates the one column, invalidates `["notes"]` on success.
- `StackPage.tsx`: call `useCompletionHistory()` (already used elsewhere, same cached query key
  `["notes", "history", userId]`, so this is a cache hit after `HistoryPage` has ever loaded —
  and a normal fetch otherwise) and render a streak badge in the header using the exported
  helper.
- `TodoNoteTile.tsx`: new highlight toggle button + indicator, wired through `TodoSidebar` →
  `StackPage` the same way `onMarkDone`/`onDelete` already are.
- `HistoryPage.tsx`: new highlight toggle button per row, using `useToggleHighlight`.
- `NoteMesh.tsx`: read `note.is_highlighted` (already flows through — `NotesStack` already
  passes the whole `note` object) and conditionally set `emissive`/`emissiveIntensity` on the
  material.
- `StarMesh.tsx` + `StarsStack.tsx`: `StarsStack` already holds the full `note` in its tracked
  map; thread a new `isHighlighted` prop into `StarMesh` (which today only receives primitives —
  `id`/`color`/etc., not the whole note) and apply the same emissive treatment.

## Explicit boundaries

- **Always**: keep "highlight" terminology out of anything that could be confused with the
  existing star-jar `visual_mode`; reuse the existing streak definition rather than inventing a
  second one; follow the existing invalidate-on-success mutation pattern (no optimistic writes).
- **Ask first**: adding the streak badge to any header besides `StackPage`'s; adding in-3D-scene
  click-to-highlight; changing the streak definition (e.g. a grace period, or counting weeks
  instead of days) — all called out as assumptions above.
- **Never**: add a new RLS policy or RPC for this (it's owner-only data, the existing policy
  already covers it); change `computeNoteTransform`/`computeStarTransform` placement logic;
  touch the `visual_mode` setting or its meaning.

## Out of scope (this iteration)

- Streak freeze/grace periods, or streak-loss notifications.
- Heatmap windows longer than ~12 months, month-by-month pagination/navigation of the heatmap,
  or a heatmap on any page besides History.
- Filtering the to-do sidebar or History list by highlighted status.
- Any highlight-related change to the Friends stack view (a friend's highlighted notes are not
  specifically called out — `get_friend_stack` already excludes everything except id/week/color/
  position/completed_at, and this spec doesn't ask to extend it).

## Testing strategy

- No test suite in this repo. Manual verification via `npm run dev`:
  - Mark a task done today → header badge shows streak ≥ 1, matches `HistoryPage`'s "Day
    streak" stat exactly.
  - Skip a day (or fake it by checking the definition against seeded `completed_at` values in
    the SQL editor) → streak resets to 0.
  - Complete several tasks on one day, one task on another → heatmap shows the heavier day in a
    visibly darker cell than the lighter day; a day with zero completions stays neutral.
  - Seed a past multi-day run longer than the current streak (via `completed_at` in the SQL
    editor) → "Longest streak" reflects that past run even though the *current* streak (header
    badge) is shorter or zero.
  - Highlight a to-do note → indicator shows in the sidebar tile; mark it done → it lands on the
    stack already glowing, no separate action needed.
  - Highlight a note directly from the History list → glow appears on its existing stack mesh
    without a page reload (query invalidation triggers a refetch).
  - Toggle `visual_mode` between spike and star-jar with a highlighted note present → glow shows
    in both.
  - Un-highlight → glow disappears; toggling is idempotent (no drift after several toggles).

## Commands

Unchanged from repo root (`npm run dev`, `npm run build`, `npm run lint`). New migration file
added under `supabase/migrations/0007_add_note_highlight.sql`, applied via the Supabase SQL
editor per the README's existing convention.
