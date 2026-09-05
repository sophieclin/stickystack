# Todo: Daily Streak & Highlighted Notes

Full task detail, rationale, and verification steps: [plan.md](plan.md). Spec:
[SPEC.md](../SPEC.md).

## Phase 1 — Streak badge (header)

- [x] Export `computeStreakDays(notes: Note[])` from `lib/completionStats.ts` (was private,
      took `Date[]`); `computeCompletionStats` calls the exported version internally
- [x] Streak badge UI (fire icon + count, grayscale at 0) added to `StackPage.tsx` header
- [x] `StackPage.tsx` calls `useCompletionHistory()` and feeds it to the badge
- [x] Verify: header badge number matches `HistoryPage`'s "Day streak" stat — confirmed live
      (both showed 0, then both showed 1 after completing a task) via chrome-devtools MCP
- [x] Verify: streak 0 → grayscale; streak ≥ 1 → full color — confirmed via computed styles
      (`streak-badge--zero` + `filter: grayscale(1)` on the icon at 0; filter removed at 1)
- [x] `npm run build && npm run lint` clean

## Phase 2 — Streak heatmap & longest streak

- [x] `longestStreak` added to `CompletionStats` in `lib/completionStats.ts` (full history, not
      windowed)
- [x] New `lib/streakHeatmap.ts`: `computeHeatmapDays(notes, months = 12)` + intensity-bucket
      helper
- [x] New `features/history/StreakHeatmap.tsx` (week-column grid, per-cell `title` w/ date+count)
- [x] `HistoryPage.tsx`: "Longest streak" stat tile + `<StreakHeatmap>` mounted
- [x] Verify: heavier-completion day renders visibly darker than a lighter day; zero-count day
      stays neutral — confirmed live against real account data (Aug 11, 7 completions →
      `streak-heatmap-cell--4`; Aug 17, 4 completions → `--3`; every zero-count day neutral)
- [x] Verify: seeded past streak longer than current streak → "Longest streak" reflects it —
      confirmed live: two non-consecutive completion days gave "Longest streak" = 1 while
      "Day streak" (current) = 0, matching the independent-definitions requirement
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo header badge + heatmap/longest-streak together — streak track done — before
starting the highlight track.

## Phase 3 — Highlight data layer + sidebar toggle

- [x] Migration `0007_add_note_highlight.sql`: `notes.is_highlighted boolean not null default
      false` — applied to the live Supabase project
- [x] `types/domain.ts`: `is_highlighted: boolean` added to `Note`
- [x] `types/database.types.ts`: `is_highlighted?: boolean` added to `notes.Update`
- [x] Hook `useToggleHighlight()`
- [x] `TodoNoteTile.tsx`: highlight toggle button + persistent indicator (ring, visible
      unselected too)
- [x] `TodoSidebar.tsx` / `StackPage.tsx`: `onToggleHighlight` threaded through
- [x] Verify: toggling updates `notes.is_highlighted` — confirmed live (button label/`pressed`
      state flips, no console errors against the live column)
- [x] Verify: indicator survives a page reload — confirmed via a real hard reload
      (`ignoreCache`), `pressed` state survived, proving it's server state not local-only
- [x] `npm run build && npm run lint` clean

## Phase 4 — Highlight on done notes + 3D glow

- [x] `HistoryPage.tsx`: highlight toggle button per row, next to "Undo"
- [x] `NoteMesh.tsx`: emissive glow when `note.is_highlighted`
- [x] `StarsStack.tsx`: `isHighlighted` prop threaded into `<StarMesh>`
- [x] `StarMesh.tsx`: accepts `isHighlighted`, same emissive treatment
- [x] Verify: highlighted note glows on the spike — confirmed live (zoomed screenshot of the top
      note shows the yellow ring-alpha glow at the note's edges)
- [x] Verify: toggle from History list → glow updates on the live mesh, no reload needed —
      confirmed: toggled from History, returned to `/app` via client-side nav (no reload), glow
      state matched the toggle each time
- [x] Verify: glow renders correctly in star-jar `visual_mode`, not just spike — confirmed live
      (switched to star-jar in Settings, zoomed screenshot shows the translucent gold halo
      reading through the jar glass)
- [x] Verify: un-highlight removes glow; repeated toggling doesn't drift — confirmed: toggled
      on/off/on/off from History (4 toggles, no drift in `pressed` state), then verified the
      glow was absent on the live mesh after the final un-highlight
- [x] `npm run build && npm run lint` clean

**Scope addition (post-Phase-4):** ★-only filter (`HighlightOnlyToggle`) added to the to-do
sidebar search, History page search, and global header search — not in the original SPEC.md,
now documented there under "Highlighting a note".
- [x] `HighlightOnlyToggle.tsx` + wiring in `GlobalSearch.tsx`/`TodoSidebar.tsx`/`HistoryPage.tsx`
- [x] Verify: toggling ★ Only in each of the three search boxes actually filters to highlighted
      notes only, and un-toggling restores the full list — confirmed live in all three
      (to-do sidebar, global header search, History page), with one highlighted + one
      not-highlighted active task and one highlighted done task as test data

**Checkpoint:** demo full highlight lifecycle (sidebar → done → glow in both visual modes →
un-highlight) before starting Phase 5.

## Phase 5 — Docs, final walkthrough

- [x] Add "Streaks & highlights" section to `CLAUDE.md` Architecture notes
- [x] Full walkthrough against every SPEC.md acceptance criterion in one pass — done live via
      chrome-devtools MCP against the real account: streak badge/grayscale, heatmap intensity
      buckets, longest streak vs. current streak, highlight toggle (sidebar + History, hard
      reload persistence), live glow (spike + star-jar, toggle-driven updates, idempotent
      un-highlight), and all three ★-only filters
- [x] `npm run build && npm run lint` clean on the final diff
