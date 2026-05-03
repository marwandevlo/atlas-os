-- Manual paid subscription pipeline (Maroc: virement / CashPlus / WhatsApp) — separate from atlas_subscriptions trial/card flow.
create extension if not exists "pgcrypto";

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_email text,
  plan text not null check (plan in ('starter', 'pro', 'business', 'cabinet')),
  status text not null default 'pending_manual' check (status in ('pending_manual', 'active', 'canceled')),
  payment_method text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_created_idx on public.subscriptions (status, created_at desc);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Writes go through service-role API routes only (no user insert/update policies).
