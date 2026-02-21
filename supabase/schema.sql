-- ============================================================
-- BadTrade Token Economy — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================

-- 1. USER TOKENS — Token balances per user
-- ============================================================
create table if not exists user_tokens (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  red_tokens  numeric(12,2) not null default 0,
  gold_tokens numeric(12,2) not null default 0,
  black_tokens numeric(12,2) not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_tokens_updated_at
  before update on user_tokens
  for each row execute function update_updated_at();

-- RLS: users can only read/write their own row
alter table user_tokens enable row level security;

create policy "Users can view own tokens"
  on user_tokens for select
  using (auth.uid() = user_id);

create policy "Users can update own tokens"
  on user_tokens for update
  using (auth.uid() = user_id);

create policy "Users can insert own tokens"
  on user_tokens for insert
  with check (auth.uid() = user_id);


-- 2. MINING LOGS — Every mine action recorded
-- ============================================================
create table if not exists mining_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  exercise_type  text not null,          -- 'pushup', 'pullup', etc.
  reps           integer not null,
  token_type     text not null,          -- 'red', 'gold'
  token_amount   numeric(12,2) not null default 0,
  status         text not null default 'success',  -- 'success', 'warning'
  created_at     timestamptz not null default now()
);

-- Index for fast user queries
create index idx_mining_logs_user on mining_logs(user_id, created_at desc);

-- RLS
alter table mining_logs enable row level security;

create policy "Users can view own mining logs"
  on mining_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own mining logs"
  on mining_logs for insert
  with check (auth.uid() = user_id);


-- 3. DAILY STATS — Aggregated daily summary
-- ============================================================
create table if not exists daily_stats (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  pushup_reps   integer not null default 0,
  pullup_reps   integer not null default 0,
  red_mined     numeric(12,2) not null default 0,
  gold_mined    numeric(12,2) not null default 0,
  mine_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One row per user per day
  unique(user_id, date)
);

create index idx_daily_stats_user on daily_stats(user_id, date desc);

create trigger trg_daily_stats_updated_at
  before update on daily_stats
  for each row execute function update_updated_at();

-- RLS
alter table daily_stats enable row level security;

create policy "Users can view own daily stats"
  on daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can upsert own daily stats"
  on daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily stats"
  on daily_stats for update
  using (auth.uid() = user_id);


-- 4. MARKETPLACE ITEMS — Products available for purchase
-- ============================================================
-- NOTE: This table may already exist in Supabase.
-- Run the ALTER TABLE below to add the duration_minutes column.

-- Full table definition for reference:
-- create table if not exists marketplace_items (
--   id             text primary key,
--   name           text not null,
--   description    text not null default '',
--   emoji          text not null default '📦',
--   cost           numeric(12,2) not null default 1,
--   token_type     text not null default 'red',
--   stock          integer default null,          -- null = unlimited
--   duration_minutes integer default null,        -- null = instant (non-timed)
--   is_active      boolean not null default true,
--   sort_order     integer not null default 0,
--   created_at     timestamptz not null default now()
-- );

-- Add duration_minutes to existing table:
alter table marketplace_items
  add column if not exists duration_minutes integer default null;
