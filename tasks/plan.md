# Implementation plan: Daily Streak & Highlighted Notes

Source of truth for requirements: [SPEC.md](../SPEC.md). This document sequences the work.

## Grounding from the codebase

- `lib/completionStats.ts` already computes a daily streak (`computeStreakDays`, private) from
  `useCompletionHistory()`'s notes — the header badge and the heatmap/longest-streak stat are
  new *surfaces* for data StickyStack already derives, not new streak math, except
  `longestStreak` (a genuinely new calculation) and the heatmap's per-day counts.
- `notes` selects `*` everywhere (`useActiveNotes`, `useDoneNotes`, `useCompletionHistory`), and
  `Note` is a `type` alias consumed directly as `database.types.ts`'s `Row` — so once
  `is_highlighted` is added to `Note`, it flows into every existing query with zero hook changes.
  Only `Update` needs a manual addition (mirrors how `status`/`completed_at` were added for
  `useCompleteNote`).
- `NoteMesh` already receives the whole `note` object (`NotesStack.tsx:27`) — the spike-mode glow
  needs no new prop plumbing. `StarMesh` only receives primitives today (`StarsStack.tsx:21-30`)
  — the jar-mode glow needs one new prop threaded from `StarsStack`, which already holds the full
  `note` in its tracked map.
- `TodoNoteTile` and `HistoryPage`'s row list are the only two places a note has DOM-list form;
  everywhere else a note is either a 3D mesh or doesn't render at all. These are therefore the
  only two places a highlight toggle control needs to be built.
- No RLS/RPC work needed anywhere in this plan — everything here is either pure client-side
  computation or a plain owner-scoped column update, unlike the Friends feature.

## Dependency graph

```
lib/completionStats.ts: export computeStreakDays, add longestStreak
        │
        ├──> Phase 1: Streak badge (StackPage header)
        │
        └──> lib/streakHeatmap.ts (new) ──> Phase 2: Heatmap + longest-streak stat (HistoryPage)

Migration 0007: notes.is_highlighted
        │
        ├──> domain.ts + database.types.ts
        │
        ├──> useToggleHighlight hook
        │       │
        │       ├──> Phase 3: Sidebar highlight toggle (TodoNoteTile/TodoSidebar)
        │       │
        │       └──> Phase 4a: History-list highlight toggle (HistoryPage)
        │
        └──> Phase 4b: 3D glow (NoteMesh + StarMesh/StarsStack)
                                                          │
                                                          └──> Phase 5: Docs, full walkthrough
```

Phase 1–2 (streak) and Phase 3–4 (highlight) are independent feature tracks that don't share
files — they can be built and demoed in either order, or in parallel across sessions. Within the
highlight track, 3 must land before 4a/4b (both need the column + hook to exist), but 4a and 4b
don't depend on each other.

## Checkpoint policy

Stop after each phase and verify in the running app (`npm run dev`) before starting the next.
Each phase leaves the app in a working, demoable state — no phase depends on a later phase's
code existing yet.

---

## Phase 1 — Streak badge (header)

**Delivers:** the current daily streak, visible in `StackPage`'s header, grayscale at 0.

1. In `lib/completionStats.ts`: export `computeStreakDays(notes: Note[])` (currently a private
   helper taking `Date[]`; change its signature to take `Note[]` directly — filter/parse
   `completed_at` internally, same as the rest of the module's public functions already do) and
   have `computeCompletionStats` call the exported version internally so there's exactly one
   implementation.
2. New small presentational piece (a function or tiny component, implementer's call) rendering a
   fire icon + count, with `filter: grayscale(1)` applied when `streakDays === 0`.
3. `StackPage.tsx`: call `useCompletionHistory()` (new call on this page; existing hook,
   `["notes", "history", userId]` query key already used by `HistoryPage`), compute
   `computeStreakDays(notes)`, render the badge in `.stack-header-right`.

**Acceptance criteria**
- Header shows the same streak number `HistoryPage`'s "Day streak" stat shows, always.
- Streak of 0 renders grayscale; streak ≥ 1 renders full color.

**Verification**
- Manual: mark a task done today, confirm the header badge and `HistoryPage`'s stat agree.
- Manual: an account with no completions today shows the grayscale badge, not a hidden/blank one.
- `npm run build && npm run lint` clean.

---

## Phase 2 — Streak heatmap & longest streak (History page)

**Delivers:** the longer-view payoff — a 12-month contribution heatmap and an all-time longest
streak, both on `HistoryPage`.

1. In `lib/completionStats.ts`: add `longestStreak` to `CompletionStats` — scan the full sorted
   set of unique completion days (not windowed to 12 months) for the longest run of consecutive
   calendar days.
2. New `lib/streakHeatmap.ts`: `computeHeatmapDays(notes: Note[], months = 12): { date: string;
   count: number }[]`, one entry per day in the trailing ~12-month window including zero-count
   days, plus a helper mapping a count to an intensity bucket (0–4) relative to the window's max
   count.
3. New `features/history/StreakHeatmap.tsx`: renders `computeHeatmapDays`'s output as a
   week-column grid, cell color driven by intensity bucket, `title` attribute per cell showing
   date + count.
4. `HistoryPage.tsx`: add a "Longest streak" tile next to the existing stat tiles; mount
   `<StreakHeatmap notes={notes} />` in a new section.

**Acceptance criteria**
- A day with more completions renders visibly darker than a day with fewer; a zero-completion
  day renders as the neutral empty cell.
- "Longest streak" reflects the longest historical run even when the *current* streak (Phase 1's
  badge) is shorter or zero.
- Heatmap covers roughly the trailing 12 months ending today, with no gaps in the grid (every
  day present, zero-count or not).

**Verification**
- Manual: complete several tasks on one day and one task on another (or seed `completed_at`
  values via the SQL editor), confirm the heavier day is visibly darker.
- Manual: seed a multi-day run further back than the current streak, confirm "Longest streak"
  picks it up.
- `npm run build && npm run lint` clean.

**Checkpoint:** demo the header badge (Phase 1) and the heatmap/longest-streak stat (Phase 2)
together before starting the highlight track — the streak feature is done end to end at this
point.

---

## Phase 3 — Highlight data layer + sidebar toggle

**Delivers:** the first working vertical slice of highlighting — a user can highlight/
un-highlight a to-do note and see it reflected in the sidebar.

1. **Migration `0007_add_note_highlight.sql`**: `alter table public.notes add column
   is_highlighted boolean not null default false;`. No RLS change (existing "update own notes"
   policy already covers it).
2. `types/domain.ts`: add `is_highlighted: boolean` to `Note`.
3. `types/database.types.ts`: add `is_highlighted?: boolean` to `notes.Update`.
4. New hook `useToggleHighlight()`: mirrors `useCompleteNote`'s shape — mutation takes `{ id,
   isHighlighted }`, updates the one column, invalidates `["notes"]` on success.
5. `TodoNoteTile.tsx`: add a highlight toggle button (selected-state affordance, matching
   delete/done) plus a persistent visual indicator (e.g. a colored ring via a CSS class) visible
   whether or not the tile is selected.
6. `TodoSidebar.tsx` → `StackPage.tsx`: thread an `onToggleHighlight(id, next)` callback the same
   way `onMarkDone`/`onDelete` are already threaded.

**Acceptance criteria**
- Toggling a to-do note's highlight updates `notes.is_highlighted` in the database.
- The sidebar tile shows a visible, persistent indicator when highlighted, without needing the
  tile selected.
- Un-highlighting clears the indicator.

**Verification**
- Manual: toggle highlight on a to-do note, confirm the column value in the Supabase table
  editor.
- Manual: indicator persists across a page reload (proves it's server state, not local-only).
- `npm run build && npm run lint` clean.

**Checkpoint:** migration `0007_add_note_highlight.sql` must be run in the Supabase SQL editor
before this phase can be manually tested, same caveat as the Friends migrations.

---

## Phase 4 — Highlight on done notes + 3D glow

**Delivers:** the actual payoff — a highlighted note keeps glowing after it's speared onto the
stack, in both visual modes, and can be toggled from the History list.

1. `HistoryPage.tsx`: add the same highlight toggle button per row (next to the existing "Undo"
   button), using `useToggleHighlight` from Phase 3.
2. `NoteMesh.tsx`: read `note.is_highlighted` (already available — no prop change needed) and
   conditionally set `emissive`/`emissiveIntensity` on the existing `meshStandardMaterial`,
   layered on top of the note's normal week color.
3. `StarsStack.tsx`: pass a new `isHighlighted={note.is_highlighted}` prop into `<StarMesh>`.
4. `StarMesh.tsx`: accept `isHighlighted`, apply the same emissive treatment to its material.

**Acceptance criteria**
- Highlighting a to-do note, then marking it done, lands it on the stack already glowing — no
  separate action needed after completion.
- Highlighting/un-highlighting from the History list updates the glow on the existing stack mesh
  without a page reload (query invalidation triggers the refetch).
- Toggling `visual_mode` between spike and star-jar with a highlighted note present shows the
  glow in both.
- Un-highlighting removes the glow; toggling repeatedly doesn't drift (idempotent).

**Verification**
- Manual: full lifecycle — highlight a to-do note → mark done → confirm it glows on landing.
- Manual: un-highlight from History → confirm the glow disappears on the live mesh.
- Manual: switch `visual_mode` in Settings, confirm glow renders correctly in both
  `StackScene`/`JarScene`.
- `npm run build && npm run lint` clean.

**Checkpoint:** demo the full highlight lifecycle (sidebar → done → glow in both visual modes →
un-highlight) before starting Phase 5.

---

## Phase 5 — Docs, final walkthrough

1. Add a short "Streaks & highlights" section to `CLAUDE.md`'s Architecture notes, matching the
   existing prose style — where the streak calc lives, why `is_highlighted` needed no RLS
   change, where the two toggle points are.
2. Full walkthrough covering every SPEC.md acceptance criterion in one pass: streak badge +
   grayscale-at-zero, heatmap intensity + longest streak, highlight toggle from both sidebar and
   History, glow in both visual modes.
3. `npm run build && npm run lint` clean on the final diff.

**Checkpoint:** final review gate — matches the Definition of Done (verification passes, no
regressions, behavior verified at runtime, docs updated).
