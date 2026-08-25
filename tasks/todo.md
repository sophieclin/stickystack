# Todo: Daily Streak & Highlighted Notes

Full task detail, rationale, and verification steps: [plan.md](plan.md). Spec:
[SPEC.md](../SPEC.md).

## Phase 1 — Streak badge (header)

- [ ] Export `computeStreakDays(notes: Note[])` from `lib/completionStats.ts` (was private,
      took `Date[]`); `computeCompletionStats` calls the exported version internally
- [ ] Streak badge UI (fire icon + count, grayscale at 0) added to `StackPage.tsx` header
- [ ] `StackPage.tsx` calls `useCompletionHistory()` and feeds it to the badge
- [ ] Verify: header badge number matches `HistoryPage`'s "Day streak" stat
- [ ] Verify: streak 0 → grayscale; streak ≥ 1 → full color
- [ ] `npm run build && npm run lint` clean

## Phase 2 — Streak heatmap & longest streak

- [ ] `longestStreak` added to `CompletionStats` in `lib/completionStats.ts` (full history, not
      windowed)
- [ ] New `lib/streakHeatmap.ts`: `computeHeatmapDays(notes, months = 12)` + intensity-bucket
      helper
- [ ] New `features/history/StreakHeatmap.tsx` (week-column grid, per-cell `title` w/ date+count)
- [ ] `HistoryPage.tsx`: "Longest streak" stat tile + `<StreakHeatmap>` mounted
- [ ] Verify: heavier-completion day renders visibly darker than a lighter day; zero-count day
      stays neutral
- [ ] Verify: seeded past streak longer than current streak → "Longest streak" reflects it
- [ ] `npm run build && npm run lint` clean

**Checkpoint:** demo header badge + heatmap/longest-streak together — streak track done — before
starting the highlight track.

## Phase 3 — Highlight data layer + sidebar toggle

- [ ] Migration `0007_add_note_highlight.sql`: `notes.is_highlighted boolean not null default
      false` — **not yet applied to the live Supabase project; run it in the SQL editor before
      manual testing**
- [ ] `types/domain.ts`: `is_highlighted: boolean` added to `Note`
- [ ] `types/database.types.ts`: `is_highlighted?: boolean` added to `notes.Update`
- [ ] Hook `useToggleHighlight()`
- [ ] `TodoNoteTile.tsx`: highlight toggle button + persistent indicator (visible unselected too)
- [ ] `TodoSidebar.tsx` / `StackPage.tsx`: `onToggleHighlight` threaded through
- [ ] Verify: toggling updates `notes.is_highlighted` in the Supabase table editor
- [ ] Verify: indicator survives a page reload
- [ ] `npm run build && npm run lint` clean

## Phase 4 — Highlight on done notes + 3D glow

- [ ] `HistoryPage.tsx`: highlight toggle button per row, next to "Undo"
- [ ] `NoteMesh.tsx`: emissive glow when `note.is_highlighted`
- [ ] `StarsStack.tsx`: `isHighlighted` prop threaded into `<StarMesh>`
- [ ] `StarMesh.tsx`: accepts `isHighlighted`, same emissive treatment
- [ ] Verify: highlight a to-do note → mark done → lands on stack already glowing
- [ ] Verify: toggle from History list → glow updates on the live mesh, no reload needed
- [ ] Verify: glow renders correctly in both `visual_mode`s (spike and star-jar)
- [ ] Verify: un-highlight removes glow; repeated toggling doesn't drift
- [ ] `npm run build && npm run lint` clean

**Checkpoint:** demo full highlight lifecycle (sidebar → done → glow in both visual modes →
un-highlight) before starting Phase 5.

## Phase 5 — Docs, final walkthrough

- [ ] Add "Streaks & highlights" section to `CLAUDE.md` Architecture notes
- [ ] Full walkthrough against every SPEC.md acceptance criterion in one pass
- [ ] `npm run build && npm run lint` clean on the final diff
