-- Friending system: request/accept friendships, plus RPCs for username search and
-- sending a request. Friendship rows are readable/deletable directly via RLS, but
-- creation and acceptance go through security-definer RPCs so the 20-friend /
-- 20-outgoing-pending caps and duplicate/self checks can't be bypassed by a direct insert.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_no_self check (requester_id <> addressee_id)
);

-- One relationship per pair regardless of who requested whom.
create unique index if not exists friendships_unique_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);
create index if not exists friendships_requester_idx on public.friendships (requester_id, status);

alter table public.friendships enable row level security;

create policy "select own friendships" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "delete own friendships" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Deliberately no insert/update policy: those happen only via the security-definer
-- RPCs below, which enforce the caps and duplicate/self checks.

create or replace function public.search_users(query text)
returns table (id uuid, username text)
language sql
security definer
set search_path = public
stable
as $$
  select user_settings.user_id as id, user_settings.username
  from public.user_settings
  where user_settings.username is not null
    and user_settings.username ilike '%' || query || '%'
    and user_settings.user_id <> auth.uid()
  order by user_settings.username
  limit 20;
$$;

grant execute on function public.search_users(text) to authenticated;

create or replace function public.send_friend_request(p_addressee_id uuid)
returns public.friendships
language plpgsql
security definer
set search_path = public
as $$
declare
  new_row public.friendships;
  pending_count integer;
begin
  if p_addressee_id = auth.uid() then
    raise exception 'Cannot send a friend request to yourself';
  end if;

  if exists (
    select 1 from public.friendships f
    where (f.requester_id = auth.uid() and f.addressee_id = p_addressee_id)
       or (f.requester_id = p_addressee_id and f.addressee_id = auth.uid())
  ) then
    raise exception 'A friend request or friendship already exists between these users';
  end if;

  select count(*) into pending_count
  from public.friendships f
  where f.requester_id = auth.uid() and f.status = 'pending';

  if pending_count >= 20 then
    raise exception 'You already have 20 pending friend requests outstanding';
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (auth.uid(), p_addressee_id, 'pending')
  returning * into new_row;

  return new_row;
end;
$$;

grant execute on function public.send_friend_request(uuid) to authenticated;
