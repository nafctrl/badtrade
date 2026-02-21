# Database Aggregation Setup Script (No Auth FK)

Since you are using a custom Login Gate (not Supabase Auth), we removed the Foreign Key constraint to `auth.users`.

Run this updated SQL in your Supabase SQL Editor:

```sql
-- 1. Create table `user_stats` (Standalone, no FK to auth.users)
create table if not exists public.user_stats (
    user_id uuid not null primary key, -- REMOVED "references auth.users"
    total_pushups int default 0,
    total_pullups int default 0,
    total_gt_mined numeric default 0,
    total_rt_spent numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Optional: If you use anon key, you need policy)
alter table public.user_stats enable row level security;

-- Allow public access (since we bypass auth for now)
-- WARNING: This is insecure for production but fine for local/dev with Dummy ID
create policy "Allow all access for user_stats" on public.user_stats
    for all using (true) with check (true);

-- 2. Create Trigger Function
create or replace function public.handle_new_mining_log()
returns trigger as $$
begin
    -- Ensure user row exists in stats table
    insert into public.user_stats (user_id)
    values (new.user_id)
    on conflict (user_id) do nothing;

    -- Update stats based on exercise type (case insensitive)
    if lower(new.exercise_type) like '%push%' then
        update public.user_stats
        set total_pushups = total_pushups + new.reps,
            updated_at = now()
        where user_id = new.user_id;

    elsif lower(new.exercise_type) like '%pull%' or lower(new.exercise_type) like '%chin%' then
        update public.user_stats
        set total_pullups = total_pullups + new.reps,
            updated_at = now()
        where user_id = new.user_id;
    end if;

    -- Update Token Totals
    if new.token_type = 'gold' then
        update public.user_stats
        set total_gt_mined = total_gt_mined + new.token_amount,
            updated_at = now()
        where user_id = new.user_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- 3. Attach Trigger to `mining_logs`
drop trigger if exists on_mining_log_created on public.mining_logs;

create trigger on_mining_log_created
    after insert on public.mining_logs
    for each row execute function public.handle_new_mining_log();


-- 4. Initial Backfill (One-time run)
insert into public.user_stats (user_id, total_pushups, total_pullups, total_gt_mined)
select 
    user_id,
    coalesce(sum(case when lower(exercise_type) like '%push%' then reps else 0 end), 0) as pushups,
    coalesce(sum(case when lower(exercise_type) like '%pull%' or lower(exercise_type) like '%chin%' then reps else 0 end), 0) as pullups,
    coalesce(sum(case when token_type = 'gold' then token_amount else 0 end), 0) as gt_mined
from public.mining_logs
group by user_id
on conflict (user_id) do update
set 
    total_pushups = excluded.total_pushups,
    total_pullups = excluded.total_pullups,
    total_gt_mined = excluded.total_gt_mined;
```
