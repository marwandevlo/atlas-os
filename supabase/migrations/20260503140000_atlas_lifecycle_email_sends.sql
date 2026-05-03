-- Idempotent transactional lifecycle emails (welcome, reminders, trial, upgrade).
create extension if not exists "pgcrypto";

create table if not exists public.atlas_lifecycle_email_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email_key text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, email_key)
);

create index if not exists atlas_lifecycle_email_sends_key_sent_idx
  on public.atlas_lifecycle_email_sends (email_key, sent_at desc);

alter table public.atlas_lifecycle_email_sends enable row level security;
-- Rows are written only from trusted server routes using the service role.
