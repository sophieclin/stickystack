# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StickyStack: a 3D sticky-note task tracker. Tasks live in a To-Do sidebar (one sticky-note
color per week). Marking a task done animates its note spearing onto a virtual receipt-spike —
a running, color-coded record of completed work, rendered with React Three Fiber.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # tsc -b (project references) && vite build
npm run lint      # oxlint
npm run preview   # preview production build
```

There is no test suite configured in this repo.

## Setup (local dev)

Requires a Supabase project: run `supabase/migrations/0001_init.sql` in the SQL editor, then
put the project URL and anon key into `.env` (see `.env.example`) as `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY`. See README.md for full steps, including the recommended dev-only
"disable email confirmation" setting.

## Architecture

### Data flow: Supabase → React Query hooks → routes

All server state goes through `src/hooks/*`, one hook per query/mutation, each wrapping
`src/lib/supabaseClient.ts` calls with `@tanstack/react-query`. There is no separate service/API
layer — hooks call `supabase.from(...)` directly. Mutations invalidate query keys on success
(e.g. `["notes"]`, `["weeks", userId]`) rather than writing optimistic cache updates.

Key hook relationships:
- `useWeeks` fetches all of a user's weeks. `useCurrentWeek` derives this week's Monday
  (`lib/dates.ts`) from that list and lazily upserts a row for it if missing (idempotent via a
  `(user_id, start_date)` unique constraint + `ignoreDuplicates`).
- `useNotesByStatus` (wrapped by `useActiveNotes` / `useDoneNotes`) joins weeks + user settings
  to filter out archived weeks before querying notes, ordered by `stack_position` (a Postgres
  `generated always as identity` column — global pierce order, not per-week).
- Archiving is a single client-computed setting (`archive_months`, 1–4): weeks older than that
  are excluded from queries, nothing is deleted server-side.

Auth is a thin context (`context/AuthProvider.tsx`) wrapping `supabase.auth`; `RequireAuth`
redirects unauthenticated users to `/login`. Row-level security in the migration enforces
per-user data isolation independent of client filtering.

### Friends: RPC-gated cross-user reads

Every other table's RLS is strictly owner-only (`auth.uid() = user_id`). Friends is the one place
the app reads another user's data, and it does so without ever relaxing that per-table RLS —
instead, `security definer` Postgres RPCs (`search_users`, `send_friend_request`,
`accept_friend_request`, `get_friend_usernames`, `get_friend_visual_mode`, `get_friend_stack` —
spread across `supabase/migrations/0004`–`0006`) each run their own friendship/cap check before
touching another user's row. The `friendships` table itself only has `select`/`delete` RLS
policies; creating or accepting a request happens only through the RPCs above, so the 20-friend /
20-pending caps and duplicate/self checks can't be bypassed by a direct insert.

`get_friend_stack` is the privacy-critical one: it never selects `notes.text` at all (not even to
null it out afterward) — there's no code path where a friend's note content can leak, by
construction. `useFriendStack` (`hooks/useFriendStack.ts`) fills the rest of the `Note`/`Week`
shape with placeholder values and feeds the result straight into the existing `StackScene`/
`JarScene` — both were already generic over `(notes, weeksById)`, so viewing a friend's pile
needed zero scene-layer changes. Which of the two renders is chosen by the *friend's*
`visual_mode`, not the viewer's own.

### Scene: `src/scene/`

`StackScene` (Canvas/lighting) → `SpikeAssembly` (base + spike + pile, owns the whole-assembly
wobble) → `NotesStack` (diffs the note list into per-note lifecycle phases) → `NoteMesh`
(one sticky note's mesh + text + animation hooks).

`NotesStack` is the phase-tracking core: it keeps a `Map<noteId, {note, phase}>` and diffs
incoming `notes` props against it every render — new ids become `"entering"`, ids no longer
present become `"exiting"` (not deleted immediately), and only removed from the map once the
exit animation's `onComplete` fires. This is what makes done-notes animate onto the spike and
(hypothetically) removed notes animate off, rather than popping in/out.

Per-note placement is a **pure function of `(note.id, pileIndex)`**, where `pileIndex` is the
note's rank within its own sorted pile (0 = bottom), computed in `NotesStack.tsx` from the
note's position in the `notes` array — deliberately *not* `note.stack_position` itself, since
that column is a single Postgres identity shared across every user's active and done notes and
has arbitrary gaps that would float a pile's first note above the base. Placement
(`transform/computeNoteTransform.ts`) is seeded via `lib/rng.ts`'s deterministic PRNG — a
golden-angle spiral plus seeded jitter for an organic pile look. Reloading the page always
reproduces the same layout with no persisted transform data; never make placement depend on
render order, timestamps, or other non-deterministic input.

Animation hooks in `scene/animation/` are GSAP timelines driven by `useLayoutEffect`, keyed
deliberately only on `active`/`groupRef` (see the `eslint-disable react-hooks/exhaustive-deps`
comments) so a timeline plays exactly once per phase transition rather than restarting on every
callback identity change:
- `useSpearAndSettle` — drop-and-bounce entrance when a note is speared onto the pile.
- `useTornAway` — shake + pull-away + shrink exit.
- `useStackImpulse` — a small, always-self-correcting rotation kick on the whole assembly
  whenever a note lands. This is a transient physical reflex only — rotation must never be
  repurposed as a navigation/browsing control.

`geometry/curledNoteGeometry.ts` builds the curled-paper mesh shape shared by all notes;
`scene/constants.ts` centralizes spike/base/note dimensions used across geometry and transform
code.

### Types

`types/domain.ts` mirrors the Supabase schema (`Note`, `Week`, `UserSettings`). Domain types are
declared with `type`, not `interface` — deliberately, because `@supabase/postgrest-js`'s
`.insert()`/`.update()` generic inference collapses to `never` against `interface`-declared
`Row` shapes in `types/database.types.ts`.

### Fonts

Two separate font systems: `@fontsource/*` packages for ordinary CSS/HTML text, and self-hosted
TTFs in `public/fonts/` (referenced via `lib/fonts.ts`'s `FONT_OPTIONS`) for the 3D note text,
required by troika-three-text (used internally by drei's `<Text>`). A user's chosen handwriting
font (`UserSettings.handwriting_font`) selects both simultaneously.
