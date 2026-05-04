-- ZAFIRIX PRO / AIZIX Aurora Core — Admin Backoffice Schema
-- Run in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS where possible.

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  company text,
  avatar_url text,
  role text not null default 'user' check (role in ('owner', 'user', 'admin', 'moderator')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'vip', 'enterprise')),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);

create index if not exists profiles_email_idx on public.profiles (email);

-- Ensure columns exist when re-running against older schema
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists company text;

-- -----------------------------------------------------------------------------
-- plans
-- -----------------------------------------------------------------------------
-- -----------------------------------------------------------------------------
-- plans (platform plans; does NOT replace atlas pricing config)
-- -----------------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price numeric default 0,
  currency text default 'USD',
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- subscriptions (admin-managed platform subscriptions snapshot)
-- -----------------------------------------------------------------------------
-- NOTE: Your project already has `public.atlas_subscriptions` and likely `public.subscriptions`
-- for other billing flows. This table is created ONLY if it doesn't already exist.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_slug text,
  status text default 'active',
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- admin_logs
-- -----------------------------------------------------------------------------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id),
  target_user_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);
create index if not exists admin_logs_target_idx on public.admin_logs (target_user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Guardrails (prevent non-admin privilege changes; protect owner)
-- -----------------------------------------------------------------------------
create or replace function public.profiles_prevent_privilege_changes()
returns trigger as $$
declare
  actor_role text;
  actor_email text;
begin
  -- If no authenticated user, allow (service role or internal jobs).
  if auth.uid() is null then
    return new;
  end if;

  -- Resolve actor role/email from profiles (RLS-safe because this runs in table trigger context).
  select p.role, p.email into actor_role, actor_email
  from public.profiles p
  where p.id = auth.uid()
  limit 1;

  -- Owner is immutable (cannot be banned/suspended/downgraded/demoted).
  if lower(coalesce(old.email, '')) = 'maizimarouane1991@gmail.com' then
    new.role := 'owner';
    new.plan := 'enterprise';
    new.status := 'active';
    return new;
  end if;

  -- Only admin/owner can change role/plan/status of any user.
  if coalesce(actor_role, '') not in ('admin', 'owner') then
    if new.role is distinct from old.role then
      raise exception 'not_allowed: role change';
    end if;
    if new.plan is distinct from old.plan then
      raise exception 'not_allowed: plan change';
    end if;
    if new.status is distinct from old.status then
      raise exception 'not_allowed: status change';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_prevent_privilege_changes on public.profiles;
create trigger profiles_prevent_privilege_changes
  before update on public.profiles
  for each row execute function public.profiles_prevent_privilege_changes();

-- -----------------------------------------------------------------------------
-- Auto-create profile rows on auth.users insert
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  -- Owner bootstrap (super admin)
  if lower(coalesce(new.email, '')) = 'maizimarouane1991@gmail.com' then
    insert into public.profiles (id, email, role, plan, status)
    values (new.id, new.email, 'owner', 'enterprise', 'active')
    on conflict (id) do update
      set email = excluded.email,
          role = 'owner',
          plan = 'enterprise',
          status = 'active';
    return new;
  end if;

  insert into public.profiles (id, email, role, plan, status)
  values (new.id, new.email, 'user', 'free', 'active')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.admin_logs enable row level security;

-- profiles: users can read their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- profiles: users can update safe fields only (NOT role/plan/status)
-- Column-level security is enforced by the trigger `profiles_prevent_privilege_changes`.
drop policy if exists "profiles_update_safe_own" on public.profiles;
create policy "profiles_update_safe_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- admin: full access to profiles
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')));

-- plans: readable by all authenticated users
drop policy if exists "plans_select_auth" on public.plans;
create policy "plans_select_auth" on public.plans
  for select using (auth.role() = 'authenticated');

-- plans: writable by admins only
drop policy if exists "plans_admin_write" on public.plans;
create policy "plans_admin_write" on public.plans
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')));

-- subscriptions: users can read their own subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- subscriptions: admins/owner can read/write all
drop policy if exists "subscriptions_admin_all" on public.subscriptions;
create policy "subscriptions_admin_all" on public.subscriptions
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')));

-- admin_logs: readable by admins only
drop policy if exists "admin_logs_admin_read" on public.admin_logs;
create policy "admin_logs_admin_read" on public.admin_logs
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')));

-- admin_logs: insertable by admins only (API uses service role; this is a fallback)
drop policy if exists "admin_logs_admin_insert" on public.admin_logs;
create policy "admin_logs_admin_insert" on public.admin_logs
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner')));

-- -----------------------------------------------------------------------------
-- Seed default plans (idempotent via slug)
-- -----------------------------------------------------------------------------
insert into public.plans (name, slug, price, currency, features, is_active)
values
  ('Free', 'free', 0, 'USD', '[]'::jsonb, true),
  ('Pro', 'pro', 49, 'USD', '[]'::jsonb, true),
  ('VIP', 'vip', 199, 'USD', '[]'::jsonb, true),
  ('Enterprise', 'enterprise', 0, 'USD', '[]'::jsonb, true)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Make yourself admin (replace email)
-- -----------------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'MY_EMAIL_HERE';

-- Owner (super admin)
update public.profiles
set role = 'owner',
    plan = 'enterprise',
    status = 'active'
where lower(email) = 'maizimarouane1991@gmail.com';

