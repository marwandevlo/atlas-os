-- Revenue stack: Paddle fields, company cap snapshot, widened status + payment_method checks.
alter table public.subscriptions add column if not exists paddle_subscription_id text;
alter table public.subscriptions add column if not exists company_limit integer;

do $body$
declare cname text;
begin
  for cname in
    select c.conname
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'subscriptions' and c.contype = 'c'
  loop
    execute format('alter table public.subscriptions drop constraint if exists %I', cname);
  end loop;
end
$body$;

alter table public.subscriptions add constraint subscriptions_plan_check
  check (plan in ('starter', 'pro', 'business', 'cabinet'));
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('trial', 'pending_manual', 'active', 'canceled'));
alter table public.subscriptions add constraint subscriptions_payment_method_check
  check (payment_method in ('manual', 'paddle'));

create unique index if not exists subscriptions_paddle_subscription_uidx
  on public.subscriptions (paddle_subscription_id)
  where paddle_subscription_id is not null and length(trim(paddle_subscription_id)) > 0;
