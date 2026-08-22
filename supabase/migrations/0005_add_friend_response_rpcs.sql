-- Accepting a request and reading friend usernames both need to bypass the
-- owner-only RLS on friendships/user_settings, so both go through
-- security-definer RPCs, same pattern as 0004's search_users/send_friend_request.

create or replace function public.accept_friend_request(p_request_id uuid)
returns public.friendships
language plpgsql
security definer
set search_path = public
as $$
declare
  target_row public.friendships;
  updated_row public.friendships;
  accepted_count integer;
begin
  select * into target_row from public.friendships where id = p_request_id;

  if not found then
    raise exception 'Friend request not found';
  end if;

  if target_row.addressee_id <> auth.uid() then
    raise exception 'Only the recipient can accept a friend request';
  end if;

  if target_row.status <> 'pending' then
    raise exception 'This request is no longer pending';
  end if;

  select count(*) into accepted_count
  from public.friendships f
  where f.status = 'accepted'
    and (f.requester_id = auth.uid() or f.addressee_id = auth.uid());

  if accepted_count >= 20 then
    raise exception 'You already have 20 friends';
  end if;

  update public.friendships
  set status = 'accepted', responded_at = now()
  where id = p_request_id
  returning * into updated_row;

  return updated_row;
end;
$$;

grant execute on function public.accept_friend_request(uuid) to authenticated;

-- Returns the username of every user who's the "other side" of one of the
-- caller's friendship rows (pending or accepted) — nothing else about them.
create or replace function public.get_friend_usernames()
returns table (user_id uuid, username text)
language sql
security definer
set search_path = public
stable
as $$
  select us.user_id, us.username
  from public.friendships f
  join public.user_settings us
    on us.user_id = case
      when f.requester_id = auth.uid() then f.addressee_id
      else f.requester_id
    end
  where f.requester_id = auth.uid() or f.addressee_id = auth.uid();
$$;

grant execute on function public.get_friend_usernames() to authenticated;
