# Implementation plan: Friends & Friend Visibility

Source of truth for requirements: [SPEC.md](../SPEC.md). This document sequences the work.

## Grounding from the codebase

- `StackScene` / `JarScene` already take generic `(notes, isLoading, weeksById)` props — neither
  is hard-wired to "the current user's" data. A friend-view page can reuse both untouched.
- `StarMesh` (star-jar mode) never renders note text at all — only color/position. `NoteMesh`
  (notes/spike mode) is the only place `note.text` is read, and only for a bullet-detection
  regex (`NoteMesh.tsx:32`) plus display. So friend-viewed notes can carry `text: ""` (not
  `null`) and need zero scene-component changes — no nullable-type plumbing.
- Every existing table's RLS is strictly owner-only (`auth.uid() = user_id`); there is no
  precedent in this repo for cross-user reads. All cross-user access must go through
  `security definer` RPCs per SPEC.md, not new RLS `select` policies on `notes`/`weeks`.
- Routes are registered flat in `src/App.tsx`; feature-specific UI subcomponents live in
  `src/features/<feature>/` (e.g. `features/notes/`, `features/week/`) with hooks in
  `src/hooks/`, one file per query/mutation — the new friends work follows the same shape.

## Dependency graph

```
Migration: friendships table + RLS
        │
        ├──> search_users RPC ──────────────┐
        │                                    │
        └──> send/accept/decline/cancel/    ├──> Phase 1: Find & request UI
             unfriend RPCs & mutations       │
                     │                        ┘
                     ├──> Phase 2: Manage requests & friends list UI
                     │
                     └──> get_friend_stack RPC ──> Phase 3: Friend stack view UI
                                                          │
                                                          └──> Phase 4: Nav wiring, docs, full walkthrough
```

Phases 1–3 are each a full vertical slice (DB → hook → UI), independently testable in the
running app before moving on. Phase 2 and Phase 3's RPC work both depend on the Phase 1
migration but not on each other's UI.

## Checkpoint policy

Stop after each phase and verify in the running app (`npm run dev`) with two real accounts
before starting the next phase. Don't let DB work from a later phase get ahead of UI from an
earlier one — each phase must be demoable end-to-end on its own.

---

## Phase 1 — Find a user & send a friend request

**Delivers:** search by username, send a request, see it land as a pending row. Minimal UI,
but a real end-to-end path.

1. **Migration `0004_add_friendships.sql`**: `public.friendships` table (`id`, `requester_id`,
   `addressee_id`, `status` in `('pending','accepted')`, `created_at`, `responded_at`), a
   no-self-friend check, a unique index preventing a duplicate pair regardless of direction, and
   RLS (`select`/`delete` where caller is requester or addressee; no direct `insert`/`update` —
   those go through RPCs below, so caller mutation happens only via `security definer` functions
   with their own cap/duplicate checks).
2. **RPC `search_users(query text)`**: `security definer`, returns `(id, username)` for
   `username ilike` matches, excluding the caller. No new privileges beyond that column pair.
3. **RPC `send_friend_request(addressee_id uuid)`**: `security definer`; rejects self-target,
   an existing pending/accepted pair in either direction, and a caller already at 20 outgoing
   pending requests; inserts the pending row.
4. **Hooks**: `useSearchUsers(query)`, `useSendFriendRequest()` (invalidates
   `["friendships", userId]`).
5. **Route + minimal UI**: `src/routes/FriendsPage.tsx` registered at `/friends` in `App.tsx`
   (wrapped in `RequireAuth`), with a `src/features/friends/FriendSearch.tsx` — a search box,
   result list, "Add friend" button per result, disabled once a request is already pending.

**Acceptance criteria**
- Searching a substring of another real user's username returns them (and not the caller).
- Sending a request creates exactly one `friendships` row with `status = 'pending'`.
- Re-sending to the same user, sending to self, or sending past the 20-pending cap are all
  rejected with a surfaced error, not a silent no-op.

**Verification**
- Manual: two accounts in two browser profiles; account A searches for B's username, sends a
  request; confirm the row in the Supabase table editor.
- SQL: call `send_friend_request` twice for the same pair and confirm the second call errors.
- `npm run build && npm run lint` clean.

---

## Phase 2 — Respond to requests, friends list, unfriend

**Delivers:** the other half of the loop — accept/decline/cancel/unfriend — and a real
"Friends" page (accepted / incoming / outgoing).

1. **RPC `accept_friend_request(request_id uuid)`**: `security definer`; only callable by the
   row's `addressee_id`; rejects if the accepting user is already at 20 accepted friends;
   flips `status` to `'accepted'`, sets `responded_at`.
2. **Decline / cancel / unfriend**: a single plain `.delete()` on `friendships` by `id` is
   sufficient (RLS already permits either party to delete their own row) — no RPC needed; the
   three actions differ only in which UI button triggers them.
3. **Hooks**: `useFriendships()` — one query returning `{ accepted, incomingPending,
   outgoingPending }` derived from a single `select` (RLS naturally scopes it to the caller's
   rows); `useAcceptFriendRequest()`; `useRemoveFriendship()` (decline/cancel/unfriend, same
   mutation).
4. **UI**: `src/features/friends/FriendRequests.tsx` (incoming, with Accept/Decline;
   outgoing, with Cancel) and `src/features/friends/FriendsList.tsx` (accepted friends, with
   Unfriend), both mounted on `FriendsPage`.

**Acceptance criteria**
- Account B sees A's request under "incoming" without a page they didn't navigate to
  refreshing on its own (poll-on-load is expected per SPEC.md — no realtime).
- Accepting on B makes the friendship show as accepted for *both* accounts on next load.
- Declining/canceling/unfriending removes the row for both accounts.
- Accepting is blocked once the accepting account already has 20 accepted friends, with a
  visible error (test by seeding 20 rows directly in SQL for one test account).

**Verification**
- Manual full loop: request → accept → appears in both accounts' friends list → unfriend →
  disappears from both.
- Manual decline and cancel paths separately.
- SQL: seed 20 accepted rows for a test user, attempt a 21st accept, confirm rejection.

---

## Phase 3 — View a friend's stack

**Delivers:** the actual payoff feature — opening a friend from the list shows their pile,
rendered in their theme, with no note text ever sent.

1. **RPC `get_friend_stack(friend_id uuid)`**: `security definer`; verifies an accepted
   friendship exists between `auth.uid()` and `friend_id` (else raises); returns that friend's
   non-archived `status = 'done'` notes — `id`, `week_id`, `stack_position`, `completed_at`,
   `text` hard-coded to `''` at the SQL level (never selected from the real column) — ordered by
   `stack_position`, plus the friend's `visual_mode` and their per-week colors (whatever
   `weeksById` needs to render, color only).
2. **Hook `useFriendStack(friendId)`**: wraps the RPC call; shape mirrors what `StackScene`/
   `JarScene` already expect (`notes`, `weeksById`) so no scene-side changes are needed.
3. **Route + UI**: `src/routes/FriendStackPage.tsx` at `/friends/:friendId`, `RequireAuth`-wrapped,
   header showing the friend's username + a back link, body rendering `<JarScene>` or
   `<StackScene>` chosen by the *friend's* `visual_mode` (not the viewer's) — same conditional
   `StackPage` already does at `StackPage.tsx`'s `settings?.visual_mode === "stars"` check, just
   sourced from the friend's settings instead of the viewer's. `FriendsList` entries link here.

**Acceptance criteria**
- Opening a friend with completed notes renders their pile/jar with visible notes but no text
  content anywhere in the rendered scene or in network payloads (verify via browser dev tools
  network tab, not just visually).
- A friend with zero completed notes renders the normal empty spike/jar, not an error.
- Calling `get_friend_stack` for a non-friend (direct RPC call, bypassing the UI) errors —
  proves the block is server-side, not just an unrendered link.
- The rendered mode matches the friend's `visual_mode`, independent of the viewer's own setting
  (test with two accounts on different modes).

**Verification**
- Manual, both directions of visual_mode mismatch (viewer on notes/friend on stars, and
  reverse).
- Manual: inspect the Network tab's response body for the `get_friend_stack` call and confirm
  no `text` field with real content is present.
- SQL: call `get_friend_stack` for a `friend_id` you're not friends with and confirm it errors.

---

## Phase 4 — Nav wiring, docs, final walkthrough

1. Add a "Friends" link into `StackPage`'s header nav (next to History/Settings).
2. Add a short "Friends" section to `CLAUDE.md`'s Architecture notes, matching the existing
   prose style (data flow, RLS-via-RPC pattern, where the code lives) — future sessions need
   this the same way they need the existing Scene/Data-flow sections.
3. Full end-to-end walkthrough with two real accounts covering every path in SPEC.md's
   acceptance criteria in one pass.
4. `npm run build && npm run lint` clean on the final diff.

**Checkpoint:** this is the final review gate before considering the feature done — matches the
Definition of Done (tests/verification pass, no regressions, behavior verified at runtime, docs
updated).
