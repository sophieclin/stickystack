-- StickyStack initial schema

create extension if not exists pgcrypto;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  archive_months integer not null default 2 check (archive_months between 1 and 4),
  handwriting_font text not null default 'caveat'
    check (handwriting_font in ('caveat', 'kalam', 'patrick-hand', 'shadows-into-light')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null, -- Monday of the week
  color text, -- hex, null until the user picks one
  created_at timestamptz not null default now(),
  constraint weeks_user_start_unique unique (user_id, start_date),
  constraint weeks_color_hex_format check (color is null or color ~* '^#[0-9a-f]{6}$')
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid not null references public.weeks(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 280),
  status text not null default 'active' check (status in ('active', 'done')),
  stack_position bigint generated always as identity,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists notes_user_status_idx on public.notes (user_id, status);
create index if not exists notes_week_idx on public.notes (week_id);
create index if not exists weeks_user_start_idx on public.weeks (user_id, start_date desc);

alter table public.user_settings enable row level security;
alter table public.weeks enable row level security;
alter table public.notes enable row level security;

create policy "select own settings" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "update own settings" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "select own weeks" on public.weeks
  for select using (auth.uid() = user_id);
create policy "insert own weeks" on public.weeks
  for insert with check (auth.uid() = user_id);
create policy "update own weeks" on public.weeks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "select own notes" on public.notes
  for select using (auth.uid() = user_id);
create policy "insert own notes" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "update own notes" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- Auto-provision a settings row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
