# Todo: Daily Streak & Highlighted Notes

Full task detail, rationale, and verification steps: [plan.md](plan.md). Spec:
[SPEC.md](../SPEC.md).

## Phase 1 — Streak badge (header)

- [x] Export `computeStreakDays(notes: Note[])` from `lib/completionStats.ts` (was private,
      took `Date[]`); `computeCompletionStats` calls the exported version internally
- [x] Streak badge UI (fire icon + count, grayscale at 0) added to `StackPage.tsx` header
- [x] `StackPage.tsx` calls `useCompletionHistory()` and feeds it to the badge
- [ ] Verify: header badge number matches `HistoryPage`'s "Day streak" stat — **not yet
      eyeballed in a browser, no browser tool available this session**
- [ ] Verify: streak 0 → grayscale; streak ≥ 1 → full color — **same caveat**
- [x] `npm run build && npm run lint` clean

## Phase 2 — Streak heatmap & longest streak

- [x] `longestStreak` added to `CompletionStats` in `lib/completionStats.ts` (full history, not
      windowed)
- [x] New `lib/streakHeatmap.ts`: `computeHeatmapDays(notes, months = 12)` + intensity-bucket
      helper
- [x] New `features/history/StreakHeatmap.tsx` (week-column grid, per-cell `title` w/ date+count)
- [x] `HistoryPage.tsx`: "Longest streak" stat tile + `<StreakHeatmap>` mounted
- [x] Verify: heavier-completion day renders visibly darker than a lighter day; zero-count day
      stays neutral — confirmed via a standalone logic check (`computeIntensityBucket`/
      `computeHeatmapDays` run against seeded data), not a browser eyeball
- [x] Verify: seeded past streak longer than current streak → "Longest streak" reflects it —
      confirmed via the same standalone check (a seeded 5-day run scored 5 independent of the
      "current streak" definition)
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo header badge + heatmap/longest-streak together — streak track done — before
starting the highlight track.

## Phase 3 — Highlight data layer + sidebar toggle

- [x] Migration `0007_add_note_highlight.sql`: `notes.is_highlighted boolean not null default
      false` — **not yet applied to the live Supabase project; run it in the SQL editor before
      manual testing**
- [x] `types/domain.ts`: `is_highlighted: boolean` added to `Note`
- [x] `types/database.types.ts`: `is_highlighted?: boolean` added to `notes.Update`
- [x] Hook `useToggleHighlight()`
- [x] `TodoNoteTile.tsx`: highlight toggle button + persistent indicator (ring, visible
      unselected too)
- [x] `TodoSidebar.tsx` / `StackPage.tsx`: `onToggleHighlight` threaded through
- [ ] Verify: toggling updates `notes.is_highlighted` in the Supabase table editor — **blocked
      until the migration is applied to the live project**
- [ ] Verify: indicator survives a page reload — **same block**
- [x] `npm run build && npm run lint` clean

## Phase 4 — Highlight on done notes + 3D glow

- [x] `HistoryPage.tsx`: highlight toggle button per row, next to "Undo"
- [x] `NoteMesh.tsx`: emissive glow when `note.is_highlighted`
- [x] `StarsStack.tsx`: `isHighlighted` prop threaded into `<StarMesh>`
- [x] `StarMesh.tsx`: accepts `isHighlighted`, same emissive treatment
- [x] Verify: highlighted note glows on the spike — confirmed by user via screenshot, went
      through two rounds of visual tuning (ring texture, scale, opacity) before landing here
- [ ] Verify: toggle from History list → glow updates on the live mesh, no reload needed — not
      specifically confirmed yet
- [ ] Verify: glow renders correctly in star-jar `visual_mode`, not just spike — not confirmed
      yet (glow mechanism differs — StarMesh uses a backface-outline trick, NoteMesh uses the
      new alpha-ring texture — so this isn't guaranteed by the spike-mode check above)
- [ ] Verify: un-highlight removes glow; repeated toggling doesn't drift — not confirmed yet
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo full highlight lifecycle (sidebar → done → glow in both visual modes →
un-highlight) before starting Phase 5.

## Phase 5 — Docs, final walkthrough

- [ ] Add "Streaks & highlights" section to `CLAUDE.md` Architecture notes
- [ ] Full walkthrough against every SPEC.md acceptance criterion in one pass
- [ ] `npm run build && npm run lint` clean on the final diff
