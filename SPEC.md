# SPEC: Friends & Friend Visibility

## Objective

Let StickyStack users become friends with each other via a request/accept flow, and let
accepted friends view each other's completed-task pile (the receipt-spike or star jar,
whichever visual theme the friend has active) — without ever exposing the friend's note text.

## Decisions locked in with the user

- **Discovery/invite mechanism**: in-app username search + friend request (no email, no invite
  links). Reuses the existing `user_settings.username` field.
- **What's visible**: visual-only. A friend's pile/jar shape, colors, and note count are
  visible; note `text` is never sent to the client for another user's notes.
- **Friendship model**: two-sided (request → accept/decline), with unfriend supported. No
  blocking in this iteration.
- **Liveness**: no realtime. Incoming/outgoing requests are fetched on page load/refetch, same
  as every other query in this app (React Query, no Supabase Realtime subscriptions).
- **Username uniqueness**: left as-is (no new constraint). Search can return ambiguous/duplicate
  usernames; results are disambiguated by picking a specific row (its `id`), same as any other
  search-and-select list.
- **Friend view route**: a new dedicated `FriendStackPage.tsx`, not a parameterized `StackPage`.
- **Limits**: two independent caps of 20 per user — max 20 accepted friends, and max 20
  outgoing pending requests in flight at once. Sending a request is blocked once outgoing-pending
  hits 20; accepting a request (by either party) is blocked once the accepting side already has
  20 accepted friends. Incoming pending requests aren't capped (you don't control how many people
  request you), but accepting is still gated by your own 20-friend ceiling.
  *(Assumption — flagging in case you meant a single combined 20 across friends+pending.)*

## Core features & acceptance criteria

### 1. Friend discovery & requests

- Search other users by username (case-insensitive partial match), excluding the caller.
- Search results expose only `id` + `username` — nothing else about a non-friend is ever
  fetched.
- Sending a request: blocked if a pending request already exists between the pair (either
  direction), if they're already friends, if the target is self, or if the sender already has
  20 outgoing pending requests.
- Recipient sees incoming pending requests next time their data loads, and can accept or
  decline.
- Sender can cancel a still-pending outgoing request.
- Accepting creates a symmetric friendship; declining or canceling deletes the pending row.
  Accepting is blocked (with a clear error) if the accepting user is already at 20 accepted
  friends.

### 2. Friends list

- A "Friends" page: accepted friends, plus incoming-pending and outgoing-pending sections.
- Either side can unfriend an accepted friendship at any time; takes effect immediately for
  both users, no confirmation step required from the other party.
- No blocking (explicitly out of scope — see below).

### 3. Viewing a friend's stack

- From the friends list, opening a friend navigates to a read-only view of their completed-task
  pile.
- Rendered using the **friend's own `visual_mode`** (spike-of-notes vs. star jar) — not the
  viewer's own setting.
- Only visual data crosses the wire: note id, status, week color, ordering/`completed_at` — no
  `text`.
- Reuses the existing `NotesStack` / `SpikeAssembly` / star-jar scene code, fed notes with
  blank/null text, rather than forking the 3D scene per audience.
- Server-side enforcement only: any non-friend pairing must be rejected by the database layer,
  not just hidden in the UI.
- Zero completed notes → renders the friend's empty spike/jar, not an error state.

## Data model (Postgres / Supabase)

- New table `public.friendships`: `id`, `requester_id uuid`, `addressee_id uuid`,
  `status text check in ('pending','accepted')`, `created_at`, `responded_at`.
  `check (requester_id <> addressee_id)`, plus a constraint preventing duplicate/reciprocal
  pending rows for the same pair.
- RLS on `friendships`: select where caller is requester or addressee; insert only as
  requester; update (accept) only by the addressee, pending → accepted; delete (cancel /
  decline / unfriend) by either party.
- **No RLS relaxation on `notes` or `weeks`** — that would leak `text` at the row level. Instead,
  a `security definer` RPC, e.g. `get_friend_stack(friend_id uuid)`, that (a) verifies an
  accepted friendship exists between `auth.uid()` and `friend_id`, then (b) returns
  non-archived, `status = 'done'` notes for that friend with `text` excluded (id, week_id, week
  color, stack_position, completed_at), ordered by `stack_position`.
- A second RPC, e.g. `search_users(query text)`, `security definer`, returning `(id, username)`
  for username matches excluding the caller (needed since `user_settings` RLS is owner-only
  today). No uniqueness constraint added on `username`; matches can be ambiguous and the caller
  picks a specific `id` from the result list.
- `get_friend_stack` (or a paired small RPC) also returns the friend's `visual_mode`, gated the
  same way.
- `friendships` insert/update enforce the 20-friend and 20-pending-outgoing caps (via a
  `security definer` RPC doing the count-and-insert atomically, rather than a plain client-side
  insert, to avoid a race past the cap).

## Client architecture

- New hooks under `src/hooks/`: `useSearchUsers`, `useSendFriendRequest`,
  `useRespondToFriendRequest` (accept/decline), `useRemoveFriendship` (covers cancel / decline /
  unfriend — same underlying delete), `useFriendships` (accepted + pending-incoming +
  pending-outgoing from one query), `useFriendStack(friendId)`.
- New routes: `src/routes/FriendsPage.tsx` (search, requests, friends list) and
  `src/routes/FriendStackPage.tsx` (read-only stack view, separate from `StackPage`).
- `NoteMesh`'s text path must tolerate `text: null` for friend-viewed notes (render blank rather
  than erroring in troika-three-text).
- Mutations invalidate a `["friendships", userId]` query key on success, matching this repo's
  existing invalidate-on-success pattern (no optimistic cache writes).

## Explicit boundaries

- **Always**: enforce friendship checks server-side (RLS/RPC) — never rely on the client to hide
  another user's data; keep `text` out of every friend-facing query/RPC response, by construction
  (column never selected), not by client-side stripping.
- **Ask first**: any change to existing RLS policies on `notes` / `weeks` / `user_settings`;
  adding a uniqueness constraint on `username` (existing rows may be null or collide — needs a
  backfill/migration decision); introducing Supabase Realtime (explicitly deferred).
- **Never**: send a friend's active (not-yet-done) notes or note text to another user; expose
  non-friend user data beyond `id` + `username` via search; add blocking/reporting this
  iteration; add push/email notifications for requests.

## Out of scope (this iteration)

- Blocking or reporting users.
- Realtime updates/badges for incoming requests.
- Email- or link-based invites for people without an existing account.
- Viewing a friend's *active* to-do list (only the completed pile is shared).
- Any opt-out/privacy toggle for being found or friended.

## Testing strategy

- No test suite exists in this repo today. Manual verification via `npm run dev`: search →
  request → accept (as the other account) → view friend's stack in both visual modes → unfriend
  → re-request.
- SQL-level checks: confirm RLS/RPC denies `get_friend_stack` for a non-friend, and confirm the
  RPC's return shape has no `text` column at all (not just a null value).

## Commands

Unchanged from repo root (`npm run dev`, `npm run build`, `npm run lint`). New migration file
added under `supabase/migrations/0004_add_friendships.sql`, applied via the Supabase SQL editor
per the README's existing convention.
