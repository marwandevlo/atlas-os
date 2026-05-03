-- Extend public.events: path, metadata, created_at (rename legacy "timestamp" if present).
alter table public.events add column if not exists path text;
alter table public.events add column if not exists metadata jsonb;

do $body$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'timestamp'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'created_at'
  ) then
    alter table public.events rename column "timestamp" to created_at;
  end if;
end
$body$;

alter table public.events add column if not exists created_at timestamptz not null default now();

drop index if exists events_name_ts_idx;
drop index if exists events_user_ts_idx;
create index if not exists events_name_created_idx
  on public.events (event_name, created_at desc);
create index if not exists events_user_created_idx
  on public.events (user_id, created_at desc)
  where user_id is not null;
