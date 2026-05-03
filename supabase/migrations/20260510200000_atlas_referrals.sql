-- Referral codes (one per user) and referral funnel rows (clicks + conversions).
-- Accessed only via service role from Next.js API routes (RLS: no policies for authenticated).

create table if not exists public.atlas_referral_codes (
  user_id uuid not null primary key references auth.users (id) on delete cascade,
  code text not null,
  created_at timestamptz not null default now(),
  constraint atlas_referral_codes_code_len check (char_length(code) >= 4 and char_length(code) <= 32)
);

create unique index if not exists atlas_referral_codes_code_key on public.atlas_referral_codes (lower(code));

create table if not exists public.atlas_referrals (
  id uuid not null default gen_random_uuid() primary key,
  referrer_user_id uuid not null references auth.users (id) on delete cascade,
  referred_user_id uuid references auth.users (id) on delete set null,
  referral_code text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  referred_welcome_bonus_applied_at timestamptz,
  referrer_reward_granted_at timestamptz,
  constraint atlas_referrals_status_check check (status in ('clicked', 'signed_up', 'activated'))
);

create index if not exists atlas_referrals_referrer_idx on public.atlas_referrals (referrer_user_id);
create index if not exists atlas_referrals_code_idx on public.atlas_referrals (lower(referral_code));
create index if not exists atlas_referrals_referred_idx on public.atlas_referrals (referred_user_id) where referred_user_id is not null;

create unique index if not exists atlas_referrals_one_conversion_per_referred
  on public.atlas_referrals (referred_user_id)
  where referred_user_id is not null;

alter table public.atlas_referral_codes enable row level security;
alter table public.atlas_referrals enable row level security;

-- No grants to anon/authenticated; service role bypasses RLS.
