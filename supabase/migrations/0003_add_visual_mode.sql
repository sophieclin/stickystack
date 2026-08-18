-- Add the hidden "star jar" alternate visual mode as a persisted user setting.

alter table public.user_settings
  add column if not exists visual_mode text not null default 'notes'
    check (visual_mode in ('notes', 'stars'));
