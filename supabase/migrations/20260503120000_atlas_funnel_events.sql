-- Basic product funnel events (server-inserted via service role from /api/funnel/track).
create extension if not exists "pgcrypto";

create table if not exists public.atlas_funnel_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  anonymous_id text,
  user_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists atlas_funnel_events_name_created_idx
  on public.atlas_funnel_events (event_name, created_at desc);

create index if not exists atlas_funnel_events_anon_created_idx
  on public.atlas_funnel_events (anonymous_id, created_at desc)
  where anonymous_id is not null and length(trim(anonymous_id)) > 0;

create index if not exists atlas_funnel_events_user_created_idx
  on public.atlas_funnel_events (user_id, created_at desc)
  where user_id is not null;

alter table public.atlas_funnel_events enable row level security;
-- Inserts are performed with the service role from trusted API routes only.
