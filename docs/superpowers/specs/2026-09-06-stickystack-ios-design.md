# StickyStack iOS App — Design Spec

Date: 2026-09-06

## Context

StickyStack is currently a web app (React + React Three Fiber + Supabase). This spec
covers a **native iOS companion app** with feature parity: the to-do sidebar, the
3D receipt-spike/jar stack visualization, star highlighting, and friending. It shares
the same Supabase backend/accounts as the web app — a user's data is the same on
both platforms.

This is sub-project 1 of 2. **Home/lock-screen widgets are explicitly out of scope
for this spec** and will be a follow-on design once this app's data layer exists,
since WidgetKit widgets need their own native Swift extension and an App
Group–based shared data mechanism regardless of what today's decisions look like.
See "Forward-compatibility for widgets" below for the one constraint this spec
carries forward on their behalf.

## Decisions

- **Tech stack**: Native Swift/SwiftUI (not React Native/Expo). Rationale: full
  WidgetKit support later, native performance, and code reuse with the web app
  would have been minimal anyway (R3F/GSAP don't port to RN either).
- **Backend**: Same Supabase project as the web app. Same accounts, same tables,
  same friend graph. No backend changes — existing RLS policies and
  `security definer` RPCs (`search_users`, `send_friend_request`,
  `accept_friend_request`, `get_friend_usernames`, `get_friend_visual_mode`,
  `get_friend_stack`) are reused as-is via `supabase-swift`.
- **3D rendering**: SceneKit (not a flattened 2D stylization). Ported look, not
  ported code — the geometry/animation/placement logic gets re-authored in Swift.
- **V1 scope**: Full feature parity with the web app (to-do sidebar, stack/jar
  visual modes, star highlighting, friends, history + heatmap, settings) — not a
  reduced core-loop-only MVP.
- **Pullout UI**: A bottom drawer/sheet (like Apple Maps), not a side drawer.
  Neobrutalist-styled: no blur/translucency, thick borders, hard offset shadows.
- **Navigation**: A single top right corner menu button (not a persistent tab bar), since a
  tab bar would compete visually with the full-bleed 3D stack background.
- **Data sync**: Refetch on mutation + pull-to-refresh, matching the web app's
  React Query invalidation pattern conceptually. No Supabase Realtime
  subscriptions in v1 — no persistent sockets, no reconnect-handling surface.
- **Project location**: New sibling directory/repo (e.g. `stickystack-ios`), not a
  subfolder of the web repo — no shared build tooling between npm and Xcode.

## Architecture

Native SwiftUI app (iOS 17+) talking directly to the shared Supabase project via
`supabase-swift`. Layering mirrors the web app conceptually, in Swift idioms:

- `Models/` — Swift structs mirroring `Note`, `Week`, `UserSettings` (Codable,
  matching the Postgres schema in `types/database.types.ts`).
- `Services/` — a thin Supabase client wrapper plus one file per resource
  (`NotesService`, `WeeksService`, `FriendsService`, `SettingsService`) exposing
  async functions — the direct analog of `src/hooks/*`, as async/await calls
  rather than React Query hooks.
- `ViewModels/` — one `ObservableObject` per screen, owning `@Published` state,
  calling into Services, refetching after mutations.
- `Views/` — SwiftUI views, one per screen/component.
- `Stack/` — the SceneKit layer (see below).

## Screens & navigation

- **StackScreen** (main/home) — SceneKit stack visual full-bleed in the
  background; a corner menu button; a bottom drawer handle tab, collapsed by
  default.
  - Dragging the handle up reveals **TodoDrawer**: this week's sticky notes, star
    toggle, ★-only filter, as a sheet with peek/full snap points.
  - Checking off a note in the drawer triggers the spear-onto-spike animation on
    the stack visible behind/around the drawer.
- **Corner menu** (tap) → sheet/full-screen menu → **Friends**, **History**,
  **Settings**.
  - **FriendsScreen** — search users, send/accept requests, list of accepted
    friends; tapping a friend pushes **FriendStackScreen** (same StackScreen
    view, read-only, fed by `get_friend_stack`, visual mode chosen by the
    friend's own settings — matching the web app's rule that the friend's mode,
    not the viewer's, decides jar vs. stack).
  - **HistoryScreen** — streak badge, 12-month heatmap, done-notes list with
    highlight toggle.
  - **SettingsScreen** — archive months, handwriting font picker, visual mode
    toggle.
- **Auth flow** — login/signup gating the above, same Supabase Auth
  (email/password) as the web app.

## 3D stack rendering (SceneKit)

Mirrors the web scene's layering, ported to SceneKit's node hierarchy:

`SpikeScene` (SCNScene setup, camera, lighting) → `SpikeAssemblyNode` (base +
spike + pile geometry, owns whole-assembly wobble via `SCNAction`) →
`NotesStackController` (same phase-tracking diff logic as `NotesStack.tsx`: a
`[noteId: (note, phase)]` map, new ids → `.entering`, removed ids → `.exiting`
until their exit action completes) → `NoteNode` (one note's `SCNGeometry` +
text + animation).

- **Placement**: `computeNoteTransform`'s golden-angle-spiral-plus-jitter math and
  `lib/rng.ts`'s seeded PRNG port directly to Swift as pure functions — same
  contract (pure function of `noteId` + `pileIndex`, reproducible on reload,
  never dependent on render order or timestamps).
- **Geometry**: `curledNoteGeometry.ts`'s curled-paper mesh shape re-authored as
  an `SCNGeometry` builder.
- **Animations**: `useSpearAndSettle` / `useTornAway` / `useStackImpulse`'s GSAP
  timelines become `SCNAction` sequences with equivalent easing/timing — same
  trigger rule (play once per phase transition, never on every state change;
  `useStackImpulse`'s rotation kick stays a transient physical reflex only,
  never a navigation control).
- **Fonts**: the self-hosted TTFs in `public/fonts/` are bundled into the app and
  used for both SwiftUI chrome text and 3D note text, so a user's
  `handwriting_font` choice looks consistent across both.
- Jar visual mode (`StarMesh`/glow) ports as a second `SCNGeometry` layer,
  keeping the two visual modes' glow implementations separate (a fix to one
  doesn't necessarily carry over to the other, same as the web app).

## Data layer & sync

- Services call Supabase directly (async/await), no client-side cache layer.
- `useCurrentWeek`'s lazy-upsert-this-week logic and `useNotesByStatus`'s
  archive-month filtering port as-is (same SQL/RPC calls, same idempotent
  unique-constraint behavior).
- Streak math (`computeStreakDays`, `longestStreak`) ports as pure Swift
  functions operating on `[Note]` — one definition, reused by both the header
  badge and History screen.
- Error handling: network/auth failures surface as an inline banner/toast per
  screen. No offline mode, no local write queue — matches the web app's scope.

## Neobrutalist visual system

Shared design tokens (colors, border widths, shadow offsets) defined once in a
`Theme.swift` / SwiftUI `EnvironmentValues` extension: thick black borders
(3–4pt) on every interactive control, hard offset drop-shadows (no blur), bold
flat colors matching the existing sticky-note week-color palette, no
gradients/translucency/blur anywhere — including the drawer sheet itself, which
must not use the default iOS frosted-glass sheet material.

## Testing

No automated test suite exists in the web repo either; v1 matches that scope —
manual simulator verification per screen (auth, note CRUD, spearing animation,
friend request flow, history/heatmap, settings). Add a lightweight `XCTest`
target scoped to the ported pure logic only (streak math, PRNG placement,
curled-note geometry math), since translation is the likeliest place for those
to silently drift from the web app's behavior. No UI test coverage required for
launch.

## Forward-compatibility for widgets (sub-project 2, not built here)

The only decision this spec makes on widgets' behalf: the data layer should be
structured so a later widget extension can read a locally-cached snapshot
(e.g. via an App Group–shared container) without needing the main app's full
Supabase session — this just means Services/Models should stay decoupled from
ViewModels/Views, not that any shared-container code gets written now.

## Out of scope

- Home screen and lock screen widgets (WidgetKit) — deferred to a follow-on spec.
- Realtime/live sync via Supabase Realtime.
- Offline mode / local write queue.
- Automated UI test coverage.
