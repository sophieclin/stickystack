-- Highlighted notes: a per-note flag, owner-scoped, no RLS change needed
-- (the existing "update own notes" policy already covers any column).

alter table public.notes
  add column if not exists is_highlighted boolean not null default false;
