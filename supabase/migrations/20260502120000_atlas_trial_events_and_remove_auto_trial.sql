-- Atlas OS: database-backed free trial anti-abuse + remove unconditional signup trial trigger.
-- Trial is granted only via application logic (POST /api/trial/claim) after checks.

create extension if not exists "pgcrypto";

create table if not exists public.atlas_trial_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email_normalized text not null,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  trial_granted boolean not null default false,
  deny_reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists atlas_trial_events_one_grant_per_email
  on public.atlas_trial_events (email_normalized)
  where trial_granted = true;

create index if not exists atlas_trial_events_fingerprint_granted_idx
  on public.atlas_trial_events (device_fingerprint)
  where trial_granted = true and device_fingerprint is not null and length(trim(device_fingerprint)) > 0;

create index if not exists atlas_trial_events_ip_granted_created_idx
  on public.atlas_trial_events (ip_address, created_at desc)
  where trial_granted = true and ip_address is not null and length(trim(ip_address)) > 0;

create index if not exists atlas_trial_events_user_idx on public.atlas_trial_events (user_id);
create index if not exists atlas_trial_events_created_idx on public.atlas_trial_events (created_at desc);

alter table public.atlas_trial_events enable row level security;
-- No policies: rows are written/read only with the Supabase service role from trusted server routes.

-- At most one free-trial subscription row per user (prevents parallel / double claim).
create unique index if not exists atlas_subscriptions_one_free_trial_per_user
  on public.atlas_subscriptions (user_id)
  where plan_id = 'free-trial';

drop trigger if exists atlas_assign_free_trial_on_signup on auth.users;
