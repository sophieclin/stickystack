-- Lets a friend view your completed-task pile without ever selecting `notes.text` —
-- the column is never named in get_friend_stack's query, so it can't leak even if a
-- future edit to this function got sloppy. Shared friendship check factored out since
-- both RPCs below need the identical security gate.

create or replace function public.is_accepted_friend(p_other_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = auth.uid() and f.addressee_id = p_other_id)
        or (f.requester_id = p_other_id and f.addressee_id = auth.uid()))
  );
$$;

grant execute on function public.is_accepted_friend(uuid) to authenticated;

create or replace function public.get_friend_visual_mode(p_friend_id uuid)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result text;
begin
  if not public.is_accepted_friend(p_friend_id) then
    raise exception 'Not friends with this user';
  end if;

  select us.visual_mode into result from public.user_settings us where us.user_id = p_friend_id;
  return result;
end;
$$;

grant execute on function public.get_friend_visual_mode(uuid) to authenticated;

-- Non-archived, done notes only, ordered for pile placement. `text` is deliberately
-- absent from the select list. archive_months mirrors lib/dates.ts's isWeekArchived.
create or replace function public.get_friend_stack(p_friend_id uuid)
returns table (
  id uuid,
  week_id uuid,
  week_color text,
  stack_position bigint,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_accepted_friend(p_friend_id) then
    raise exception 'Not friends with this user';
  end if;

  return query
    select n.id, n.week_id, w.color, n.stack_position, n.completed_at
    from public.notes n
    join public.weeks w on w.id = n.week_id
    join public.user_settings us on us.user_id = p_friend_id
    where n.user_id = p_friend_id
      and n.status = 'done'
      and w.start_date >= (current_date - (us.archive_months || ' months')::interval)
    order by n.stack_position asc;
end;
$$;

grant execute on function public.get_friend_stack(uuid) to authenticated;
