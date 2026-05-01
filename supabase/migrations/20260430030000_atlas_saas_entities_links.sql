-- Atlas OS: SaaS entities (hybrid schema) + flexible linking.
-- Mixed-mode: safe to apply now; app stays local until NEXT_PUBLIC_ATLAS_DATA_BACKEND=supabase.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Clients (distinct from companies: invoice counterparties)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,

  name text not null,
  email text,
  phone text,
  address text,
  city text,

  payment_terms_days integer not null default 30,
  balance_mad numeric not null default 0,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_clients_user_idx on public.atlas_clients (user_id);
create index if not exists atlas_clients_company_idx on public.atlas_clients (company_id);

-- ---------------------------------------------------------------------------
-- Invoices (client invoices)
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'atlas_invoice_status') then
    create type public.atlas_invoice_status as enum ('draft', 'sent', 'paid', 'cancelled');
  end if;
end $$;

create table if not exists public.atlas_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,
  client_id uuid references public.atlas_clients (id) on delete set null,

  number text not null,
  client_name text not null,

  issue_date date not null,
  payment_terms_days integer not null default 30,
  due_date date not null,

  amount_ht numeric not null default 0,
  vat_rate numeric not null default 0,
  vat_amount numeric not null default 0,
  total_ttc numeric not null default 0,

  status public.atlas_invoice_status not null default 'sent',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_invoices_user_idx on public.atlas_invoices (user_id);
create index if not exists atlas_invoices_company_idx on public.atlas_invoices (company_id);
create index if not exists atlas_invoices_client_idx on public.atlas_invoices (client_id);
create index if not exists atlas_invoices_issue_idx on public.atlas_invoices (issue_date);
create index if not exists atlas_invoices_due_idx on public.atlas_invoices (due_date);

-- ---------------------------------------------------------------------------
-- Payments (supports partial payments)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,
  invoice_id uuid not null references public.atlas_invoices (id) on delete cascade,

  paid_amount numeric not null default 0,
  paid_at date,
  note text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_payments_user_idx on public.atlas_payments (user_id);
create index if not exists atlas_payments_invoice_idx on public.atlas_payments (invoice_id);
create index if not exists atlas_payments_company_idx on public.atlas_payments (company_id);

-- ---------------------------------------------------------------------------
-- Documents (uploads/OCR artifacts, can be linked)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,

  title text not null,
  kind text not null default 'generic',
  source text not null default 'manual', -- manual|ocr|ai|import
  status text not null default 'active',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_documents_user_idx on public.atlas_documents (user_id);
create index if not exists atlas_documents_company_idx on public.atlas_documents (company_id);

-- ---------------------------------------------------------------------------
-- Employees (RH)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,

  full_name text not null,
  email text,
  phone text,
  role_title text,
  status text not null default 'active',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_employees_user_idx on public.atlas_employees (user_id);
create index if not exists atlas_employees_company_idx on public.atlas_employees (company_id);

-- ---------------------------------------------------------------------------
-- Projects (Étude / Project)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,

  name text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists atlas_projects_user_idx on public.atlas_projects (user_id);
create index if not exists atlas_projects_company_idx on public.atlas_projects (company_id);

-- ---------------------------------------------------------------------------
-- Generic links (flexible graph)
-- ---------------------------------------------------------------------------
create table if not exists public.atlas_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.atlas_companies (id) on delete set null,

  from_type text not null,
  from_id uuid not null,
  to_type text not null,
  to_id uuid not null,
  relation text not null default 'relates_to',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists atlas_links_user_idx on public.atlas_links (user_id);
create index if not exists atlas_links_company_idx on public.atlas_links (company_id);
create index if not exists atlas_links_from_idx on public.atlas_links (from_type, from_id);
create index if not exists atlas_links_to_idx on public.atlas_links (to_type, to_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.atlas_clients enable row level security;
alter table public.atlas_invoices enable row level security;
alter table public.atlas_payments enable row level security;
alter table public.atlas_documents enable row level security;
alter table public.atlas_employees enable row level security;
alter table public.atlas_projects enable row level security;
alter table public.atlas_links enable row level security;

-- helper: policies per table (select/insert/update/delete)
-- atlas_clients
drop policy if exists "atlas_clients_select_own" on public.atlas_clients;
create policy "atlas_clients_select_own" on public.atlas_clients for select using (auth.uid() = user_id);
drop policy if exists "atlas_clients_insert_own" on public.atlas_clients;
create policy "atlas_clients_insert_own" on public.atlas_clients for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_clients_update_own" on public.atlas_clients;
create policy "atlas_clients_update_own" on public.atlas_clients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_clients_delete_own" on public.atlas_clients;
create policy "atlas_clients_delete_own" on public.atlas_clients for delete using (auth.uid() = user_id);

-- atlas_invoices
drop policy if exists "atlas_invoices_select_own" on public.atlas_invoices;
create policy "atlas_invoices_select_own" on public.atlas_invoices for select using (auth.uid() = user_id);
drop policy if exists "atlas_invoices_insert_own" on public.atlas_invoices;
create policy "atlas_invoices_insert_own" on public.atlas_invoices for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_invoices_update_own" on public.atlas_invoices;
create policy "atlas_invoices_update_own" on public.atlas_invoices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_invoices_delete_own" on public.atlas_invoices;
create policy "atlas_invoices_delete_own" on public.atlas_invoices for delete using (auth.uid() = user_id);

-- atlas_payments
drop policy if exists "atlas_payments_select_own" on public.atlas_payments;
create policy "atlas_payments_select_own" on public.atlas_payments for select using (auth.uid() = user_id);
drop policy if exists "atlas_payments_insert_own" on public.atlas_payments;
create policy "atlas_payments_insert_own" on public.atlas_payments for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_payments_update_own" on public.atlas_payments;
create policy "atlas_payments_update_own" on public.atlas_payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_payments_delete_own" on public.atlas_payments;
create policy "atlas_payments_delete_own" on public.atlas_payments for delete using (auth.uid() = user_id);

-- atlas_documents
drop policy if exists "atlas_documents_select_own" on public.atlas_documents;
create policy "atlas_documents_select_own" on public.atlas_documents for select using (auth.uid() = user_id);
drop policy if exists "atlas_documents_insert_own" on public.atlas_documents;
create policy "atlas_documents_insert_own" on public.atlas_documents for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_documents_update_own" on public.atlas_documents;
create policy "atlas_documents_update_own" on public.atlas_documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_documents_delete_own" on public.atlas_documents;
create policy "atlas_documents_delete_own" on public.atlas_documents for delete using (auth.uid() = user_id);

-- atlas_employees
drop policy if exists "atlas_employees_select_own" on public.atlas_employees;
create policy "atlas_employees_select_own" on public.atlas_employees for select using (auth.uid() = user_id);
drop policy if exists "atlas_employees_insert_own" on public.atlas_employees;
create policy "atlas_employees_insert_own" on public.atlas_employees for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_employees_update_own" on public.atlas_employees;
create policy "atlas_employees_update_own" on public.atlas_employees for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_employees_delete_own" on public.atlas_employees;
create policy "atlas_employees_delete_own" on public.atlas_employees for delete using (auth.uid() = user_id);

-- atlas_projects
drop policy if exists "atlas_projects_select_own" on public.atlas_projects;
create policy "atlas_projects_select_own" on public.atlas_projects for select using (auth.uid() = user_id);
drop policy if exists "atlas_projects_insert_own" on public.atlas_projects;
create policy "atlas_projects_insert_own" on public.atlas_projects for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_projects_update_own" on public.atlas_projects;
create policy "atlas_projects_update_own" on public.atlas_projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_projects_delete_own" on public.atlas_projects;
create policy "atlas_projects_delete_own" on public.atlas_projects for delete using (auth.uid() = user_id);

-- atlas_links
drop policy if exists "atlas_links_select_own" on public.atlas_links;
create policy "atlas_links_select_own" on public.atlas_links for select using (auth.uid() = user_id);
drop policy if exists "atlas_links_insert_own" on public.atlas_links;
create policy "atlas_links_insert_own" on public.atlas_links for insert with check (auth.uid() = user_id);
drop policy if exists "atlas_links_update_own" on public.atlas_links;
create policy "atlas_links_update_own" on public.atlas_links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "atlas_links_delete_own" on public.atlas_links;
create policy "atlas_links_delete_own" on public.atlas_links for delete using (auth.uid() = user_id);

