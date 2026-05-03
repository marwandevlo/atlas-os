-- Admin JWT can read manual subscription requests (dashboard uses service role; policy helps direct Supabase reads).
drop policy if exists "subscriptions_admin_select" on public.subscriptions;
create policy "subscriptions_admin_select"
  on public.subscriptions for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
