-- Product analytics events (server-inserted via service role from /api/analytics/track).
create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null,
  "timestamp" timestamptz not null default now()
);

create index if not exists events_name_ts_idx
  on public.events (event_name, "timestamp" desc);

create index if not exists events_user_ts_idx
  on public.events (user_id, "timestamp" desc)
  where user_id is not null;

alter table public.events enable row level security;
