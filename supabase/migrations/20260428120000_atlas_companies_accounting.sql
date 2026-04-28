-- Atlas OS: companies + accounting (JSON payload per row for smooth migration from localStorage).
-- Apply in Supabase SQL editor or via CLI: `supabase db push`
-- After apply: set NEXT_PUBLIC_ATLAS_DATA_BACKEND=supabase and implement upsert flows from the UI.

create extension if not exists "pgcrypto";

create table if not exists public.atlas_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  legacy_local_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_companies_user_id_idx on public.atlas_companies (user_id);

create table if not exists public.atlas_accounting_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,
  entry_json jsonb not null default '{}'::jsonb,
  entry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_accounting_entries_user_idx on public.atlas_accounting_entries (user_id);
create index if not exists atlas_accounting_entries_company_idx on public.atlas_accounting_entries (company_id);

alter table public.atlas_companies enable row level security;
alter table public.atlas_accounting_entries enable row level security;

drop policy if exists "atlas_companies_select_own" on public.atlas_companies;
create policy "atlas_companies_select_own"
  on public.atlas_companies for select
  using (auth.uid() = user_id);

drop policy if exists "atlas_companies_insert_own" on public.atlas_companies;
create policy "atlas_companies_insert_own"
  on public.atlas_companies for insert
  with check (auth.uid() = user_id);

drop policy if exists "atlas_companies_update_own" on public.atlas_companies;
create policy "atlas_companies_update_own"
  on public.atlas_companies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "atlas_companies_delete_own" on public.atlas_companies;
create policy "atlas_companies_delete_own"
  on public.atlas_companies for delete
  using (auth.uid() = user_id);

drop policy if exists "atlas_accounting_select_own" on public.atlas_accounting_entries;
create policy "atlas_accounting_select_own"
  on public.atlas_accounting_entries for select
  using (auth.uid() = user_id);

drop policy if exists "atlas_accounting_insert_own" on public.atlas_accounting_entries;
create policy "atlas_accounting_insert_own"
  on public.atlas_accounting_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "atlas_accounting_update_own" on public.atlas_accounting_entries;
create policy "atlas_accounting_update_own"
  on public.atlas_accounting_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "atlas_accounting_delete_own" on public.atlas_accounting_entries;
create policy "atlas_accounting_delete_own"
  on public.atlas_accounting_entries for delete
  using (auth.uid() = user_id);
