-- Run once in Supabase SQL Editor.
create table if not exists public.xm_quotes (
  id integer primary key default 1 check (id = 1),
  symbol text not null,
  bid double precision not null,
  ask double precision not null,
  price double precision not null,
  broker_time timestamptz not null,
  received_at timestamptz not null default now()
);
alter table public.xm_quotes enable row level security;
