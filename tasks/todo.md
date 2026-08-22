# Todo: Friends & Friend Visibility

Full task detail, rationale, and verification steps: [plan.md](plan.md). Spec:
[SPEC.md](../SPEC.md).

## Phase 1 — Find a user & send a friend request

- [x] Migration `0004_add_friendships.sql`: `friendships` table + no-self check + unique pair
      index + RLS (select/delete only; mutations via RPC) — **not yet applied to the live
      Supabase project; run it in the SQL editor before manual testing**
- [x] RPC `search_users(query text)`
- [x] RPC `send_friend_request(addressee_id uuid)` (self/duplicate/20-pending-cap checks)
- [x] Hook `useSearchUsers`
- [x] Hook `useSendFriendRequest`
- [x] Route `/friends` → `FriendsPage.tsx` (registered in `App.tsx`, `RequireAuth`-wrapped)
- [x] `features/friends/FriendSearch.tsx` (search box, results, "Add friend")
- [ ] Verify: search excludes self, finds substring matches
- [ ] Verify: duplicate / self / >20-pending requests all rejected with a surfaced error
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo search → send request → row visible in Supabase table editor, with two
accounts, before starting Phase 2.

## Phase 2 — Respond to requests, friends list, unfriend

- [ ] RPC `accept_friend_request(request_id uuid)` (addressee-only, 20-friend-cap check)
- [ ] Decline/cancel/unfriend via plain `.delete()` (no RPC needed — RLS already scopes it)
- [ ] Hook `useFriendships` (accepted / incoming-pending / outgoing-pending)
- [ ] Hook `useAcceptFriendRequest`
- [ ] Hook `useRemoveFriendship` (decline/cancel/unfriend)
- [ ] `features/friends/FriendRequests.tsx` (incoming + outgoing, mounted on `FriendsPage`)
- [ ] `features/friends/FriendsList.tsx` (accepted friends + Unfriend, mounted on `FriendsPage`)
- [ ] Verify: full loop — request → accept → shows on both accounts → unfriend → gone on both
- [ ] Verify: decline path and cancel path independently
- [ ] Verify: 20-accepted-friend cap blocks acceptance (seed 20 rows via SQL to test)
- [ ] `npm run build && npm run lint` clean

**Checkpoint:** demo the full request/accept/decline/cancel/unfriend loop with two accounts
before starting Phase 3.

## Phase 3 — View a friend's stack

- [ ] RPC `get_friend_stack(friend_id uuid)` — accepted-friendship check, `text` hard-coded to
      `''` at the SQL level, returns friend's `visual_mode` + done notes + week colors
- [ ] Hook `useFriendStack(friendId)`
- [ ] Route `/friends/:friendId` → `FriendStackPage.tsx` (`RequireAuth`-wrapped)
- [ ] `FriendStackPage` renders `JarScene`/`StackScene` chosen by the *friend's* `visual_mode`
- [ ] `FriendsList` entries link to `/friends/:friendId`
- [ ] Verify: friend's pile renders, no `text` content anywhere (check Network tab payload, not
      just the screen)
- [ ] Verify: zero-completed-notes friend renders empty state, not an error
- [ ] Verify: direct RPC call for a non-friend `friend_id` errors server-side
- [ ] Verify: rendered mode follows the friend's setting in both mismatch directions
- [ ] `npm run build && npm run lint` clean

**Checkpoint:** demo opening a friend's stack in both visual modes, plus the non-friend-blocked
and empty-state cases, before starting Phase 4.

## Phase 4 — Nav wiring, docs, final walkthrough

- [ ] Add "Friends" link to `StackPage` header nav
- [ ] Add a Friends section to `CLAUDE.md` Architecture notes
- [ ] Full two-account walkthrough covering every SPEC.md acceptance criterion in one pass
- [ ] `npm run build && npm run lint` clean on the final diff
