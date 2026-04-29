-- Atlas OS: invoices persistence (minimal columns + full JSON payload).
-- Apply in Supabase SQL editor or via CLI: `supabase db push`

create extension if not exists "pgcrypto";

create table if not exists public.atlas_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Local UI uses numeric ids; keep them for stable mapping.
  legacy_local_id bigint,

  montant numeric not null default 0,
  statut text not null default 'sent',
  date_emission date,
  date_echeance date,

  -- Keep full payload so UI never loses fields.
  invoice_json jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists atlas_invoices_user_legacy_unique
  on public.atlas_invoices (user_id, legacy_local_id);

create index if not exists atlas_invoices_user_id_idx on public.atlas_invoices (user_id);
create index if not exists atlas_invoices_date_emission_idx on public.atlas_invoices (date_emission);

alter table public.atlas_invoices enable row level security;

drop policy if exists "atlas_invoices_select_own" on public.atlas_invoices;
create policy "atlas_invoices_select_own"
  on public.atlas_invoices for select
  using (auth.uid() = user_id);

drop policy if exists "atlas_invoices_insert_own" on public.atlas_invoices;
create policy "atlas_invoices_insert_own"
  on public.atlas_invoices for insert
  with check (auth.uid() = user_id);

drop policy if exists "atlas_invoices_update_own" on public.atlas_invoices;
create policy "atlas_invoices_update_own"
  on public.atlas_invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "atlas_invoices_delete_own" on public.atlas_invoices;
create policy "atlas_invoices_delete_own"
  on public.atlas_invoices for delete
  using (auth.uid() = user_id);

