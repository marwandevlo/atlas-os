-- Allow admin (app_metadata.role=admin) to read/manage subscriptions/payments.
-- This complements the existing "own user" select policies.

-- payment requests: admin read all
drop policy if exists "atlas_payment_requests_admin_select" on public.atlas_payment_requests;
create policy "atlas_payment_requests_admin_select"
  on public.atlas_payment_requests for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- subscriptions: admin read all
drop policy if exists "atlas_subscriptions_admin_select" on public.atlas_subscriptions;
create policy "atlas_subscriptions_admin_select"
  on public.atlas_subscriptions for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

