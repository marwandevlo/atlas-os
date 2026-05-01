-- Atlas OS: assign Free Trial on user signup.
-- This is launch-critical so Supabase mode has an initial subscription without relying on client-side localStorage.

create extension if not exists "pgcrypto";

create or replace function public.atlas_assign_free_trial_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  start_ymd date := current_date;
  end_ymd date := (current_date + interval '7 days')::date;
begin
  -- Insert only if the user doesn't already have a trial/active subscription.
  if exists (
    select 1
    from public.atlas_subscriptions s
    where s.user_id = new.id
      and s.status in ('trial', 'active')
    limit 1
  ) then
    return new;
  end if;

  insert into public.atlas_subscriptions (
    id,
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_request_id,
    metadata
  ) values (
    gen_random_uuid(),
    new.id,
    'free-trial',
    'trial',
    start_ymd,
    end_ymd,
    null,
    jsonb_build_object('source', 'signup_trigger')
  );

  return new;
end;
$$;

drop trigger if exists atlas_assign_free_trial_on_signup on auth.users;
create trigger atlas_assign_free_trial_on_signup
after insert on auth.users
for each row
execute function public.atlas_assign_free_trial_on_signup();

