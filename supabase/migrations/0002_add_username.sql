-- Add a user-editable display name, shown in the app header instead of email.

alter table public.user_settings
  add column if not exists username text
    check (username is null or char_length(username) between 2 and 30);

-- Seed it from the signup form's username (passed as auth user metadata),
-- so the settings row already has a name on first insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id, username)
  values (new.id, new.raw_user_meta_data ->> 'username')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
