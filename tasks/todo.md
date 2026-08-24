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

- [x] RPC `accept_friend_request(request_id uuid)` (addressee-only, 20-friend-cap check)
- [x] Decline/cancel/unfriend via plain `.delete()` (no RPC needed — RLS already scopes it)
- [x] Hook `useFriendships` (accepted / incoming-pending / outgoing-pending)
- [x] Hook `useAcceptFriendRequest`
- [x] Hook `useRemoveFriendship` (decline/cancel/unfriend)
- [x] `features/friends/FriendRequests.tsx` (incoming + outgoing, mounted on `FriendsPage`)
- [x] `features/friends/FriendsList.tsx` (accepted friends + Unfriend, mounted on `FriendsPage`)
- [x] Bonus (needed for display): RPC `get_friend_usernames` + wired into `useFriendships`,
      since request/friend rows only carry ids, not usernames — **migration
      `0005_add_friend_response_rpcs.sql` not yet applied to the live project**
- [x] Verify: full loop — request → accept → shows on both accounts (user-confirmed working)
- [ ] Verify: decline path and cancel path independently
- [ ] Verify: 20-accepted-friend cap blocks acceptance (seed 20 rows via SQL to test)
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo the full request/accept/decline/cancel/unfriend loop with two accounts
before starting Phase 3.

## Phase 3 — View a friend's stack

- [x] RPC `get_friend_stack(friend_id uuid)` — accepted-friendship check, `text` never selected
      at the SQL level, returns done notes + week colors (paired with `get_friend_visual_mode`,
      both gated by a shared `is_accepted_friend` check) — **migration
      `0006_add_friend_stack_rpc.sql` not yet applied to the live project**
- [x] Hook `useFriendStack(friendId)`
- [x] Route `/friends/:friendId` → `FriendStackPage.tsx` (`RequireAuth`-wrapped)
- [x] `FriendStackPage` renders `JarScene`/`StackScene` chosen by the *friend's* `visual_mode`
- [x] `FriendsList` entries link to `/friends/:friendId`
- [x] Verify: friend's pile renders (user-confirmed working; Network-tab no-`text` check not
      separately verified)
- [ ] Verify: zero-completed-notes friend renders empty state, not an error
- [ ] Verify: direct RPC call for a non-friend `friend_id` errors server-side
- [ ] Verify: rendered mode follows the friend's setting in both mismatch directions
- [x] `npm run build && npm run lint` clean

**Checkpoint:** demo opening a friend's stack in both visual modes, plus the non-friend-blocked
and empty-state cases, before starting Phase 4.

## Phase 4 — Nav wiring, docs, final walkthrough

- [x] Add "Friends" link to `StackPage` header nav (pulled forward early — see commit
      `67d694a`, was blocking Phase 2 manual testing)
- [x] Add a Friends section to `CLAUDE.md` Architecture notes
- [ ] Full two-account walkthrough covering every SPEC.md acceptance criterion in one pass —
      core paths (search/request/accept/decline/cancel/unfriend/view-stack) are user-confirmed
      working; not yet run as one deliberate end-to-end pass against every acceptance criterion
      (20-friend cap, non-friend RPC rejection, zero-notes empty state, Network-tab no-`text`
      check are still open)
- [x] `npm run build && npm run lint` clean on the final diff
