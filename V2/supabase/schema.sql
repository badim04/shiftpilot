-- Rota — Supabase schema
-- Run this once in the Supabase SQL Editor (Project ▸ SQL Editor ▸ New query).
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + DROP POLICY guards.

------------------------------------------------------------------------------
-- 1. Profiles (user role + company link)
------------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null check (role in ('worker','manager')),
  worker_id    text,                 -- for worker accounts, references workers.id
  company_id   text,                 -- for manager accounts (their main company)
  created_at   timestamptz not null default now()
);

------------------------------------------------------------------------------
-- 2. Companies (each tenant)
------------------------------------------------------------------------------
create table if not exists public.companies (
  id        text primary key,        -- 'oak' / 'bright' / 'metro' (slug)
  owner_id  uuid not null references auth.users(id) on delete cascade,
  name      text not null,
  short     text not null,
  color     text not null,
  kind      text not null,
  created_at timestamptz not null default now()
);
create index if not exists companies_owner_idx on public.companies(owner_id);

------------------------------------------------------------------------------
-- 3. Workers (per-company roster)
------------------------------------------------------------------------------
create table if not exists public.workers (
  id          text primary key,      -- 'jamie' / 'priya' / ... (slug per owner)
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  first_name  text not null,
  initials    text not null,
  color       text not null,
  rate        numeric(6,2) not null,
  holiday     numeric(6,2) not null default 0,
  rtw         boolean not null default true,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists workers_owner_idx on public.workers(owner_id);

------------------------------------------------------------------------------
-- 4. Shifts
------------------------------------------------------------------------------
create table if not exists public.shifts (
  id          text primary key,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  company_id  text not null references public.companies(id) on delete cascade,
  worker_id   text references public.workers(id) on delete set null,
  role        text not null,
  shift_date  date not null,
  start_time  text not null,         -- 'HH:MM'
  end_time    text not null,         -- 'HH:MM'
  rate        numeric(6,2) not null,
  status      text not null check (status in ('scheduled','active','completed','open')),
  clock_in    text,
  clock_out   text,
  break_mins  int  not null default 30,
  swap        boolean not null default false,
  drop_req    boolean not null default false,
  approved    boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists shifts_owner_idx on public.shifts(owner_id);
create index if not exists shifts_company_date_idx on public.shifts(company_id, shift_date);
create index if not exists shifts_worker_idx on public.shifts(worker_id);

------------------------------------------------------------------------------
-- 5. Availability (one row per user per day per period)
------------------------------------------------------------------------------
create table if not exists public.availability (
  owner_id   uuid not null references auth.users(id) on delete cascade,
  worker_id  text not null references public.workers(id) on delete cascade,
  day        text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  period     text not null check (period in ('morning','afternoon','evening','night')),
  available  boolean not null,
  primary key (owner_id, worker_id, day, period)
);

------------------------------------------------------------------------------
-- 6. Message threads + messages
------------------------------------------------------------------------------
create table if not exists public.threads (
  id         text primary key,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  company_id text not null references public.companies(id) on delete cascade,
  worker_id  text not null references public.workers(id) on delete cascade,
  unread     boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists threads_owner_idx on public.threads(owner_id);

create table if not exists public.messages (
  id         bigserial primary key,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  thread_id  text not null references public.threads(id) on delete cascade,
  sender     text not null check (sender in ('manager','worker')),
  body       text not null,
  ts_label   text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx on public.messages(thread_id);

------------------------------------------------------------------------------
-- 7. RLS — owner-scoped: each row keyed to auth.uid()
------------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.companies    enable row level security;
alter table public.workers      enable row level security;
alter table public.shifts       enable row level security;
alter table public.availability enable row level security;
alter table public.threads      enable row level security;
alter table public.messages     enable row level security;

drop policy if exists "profiles self"      on public.profiles;
drop policy if exists "companies owner"    on public.companies;
drop policy if exists "workers owner"      on public.workers;
drop policy if exists "shifts owner"       on public.shifts;
drop policy if exists "availability owner" on public.availability;
drop policy if exists "threads owner"      on public.threads;
drop policy if exists "messages owner"     on public.messages;

create policy "profiles self" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "companies owner" on public.companies
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workers owner" on public.workers
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "shifts owner" on public.shifts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "availability owner" on public.availability
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "threads owner" on public.threads
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "messages owner" on public.messages
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

------------------------------------------------------------------------------
-- 8. Realtime: enable broadcast on the tables the app subscribes to
------------------------------------------------------------------------------
alter publication supabase_realtime add table public.shifts;
alter publication supabase_realtime add table public.threads;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.availability;

------------------------------------------------------------------------------
-- 9. Seed function — called automatically the first time a user signs in.
--    Mirrors the prototype demo data (Oakwood Hospitality + 8 staff + this week).
------------------------------------------------------------------------------
create or replace function public.rota_seed_for_user(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  monday date;
  today_dow int;
  i int;
begin
  -- only seed if the user has nothing
  if exists (select 1 from public.companies where owner_id = p_uid) then
    return;
  end if;

  -- compute week reference points
  today_dow := extract(isodow from current_date)::int - 1; -- 0..6
  monday    := current_date - today_dow;

  -- companies
  insert into public.companies(id, owner_id, name, short, color, kind) values
    ('oak',    p_uid, 'Oakwood Hospitality', 'Oakwood',    '#E0A458', 'Hospitality'),
    ('bright', p_uid, 'BrightCare',          'BrightCare', '#56B6A6', 'Care'),
    ('metro',  p_uid, 'Metro Logistics',     'Metro',      '#7E8BF0', 'Logistics');

  -- workers
  insert into public.workers(id, owner_id, name, first_name, initials, color, rate, holiday, rtw) values
    ('jamie', p_uid, 'Jamie Ellis',  'Jamie', 'JE', '#E0A458', 12.60, 34.5, true),
    ('priya', p_uid, 'Priya Shah',   'Priya', 'PS', '#6BA3E5', 12.60, 51.0, true),
    ('tom',   p_uid, 'Tom Okafor',   'Tom',   'TO', '#56B6A6', 13.40, 22.0, true),
    ('mia',   p_uid, 'Mia Fenton',   'Mia',   'MF', '#D98BB0', 11.60, 18.5, true),
    ('liam',  p_uid, 'Liam Doyle',   'Liam',  'LD', '#C9885B', 11.60,  9.0, true),
    ('sara',  p_uid, 'Sara Nowak',   'Sara',  'SN', '#8E83E0', 14.20, 63.5, true),
    ('dan',   p_uid, 'Dan Reeves',   'Dan',   'DR', '#5FB0A0', 12.00, 41.0, false),
    ('aisha', p_uid, 'Aisha Khan',   'Aisha', 'AK', '#E3A06B', 13.40, 27.5, true);

  -- availability defaults for jamie
  for i in 0..6 loop
    insert into public.availability(owner_id, worker_id, day, period, available)
    select p_uid, 'jamie',
           (array['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])[i+1],
           p,
           true
    from unnest(array['morning','afternoon','evening','night']) p
    on conflict do nothing;
  end loop;

  -- shifts (mirrors prototype this-week)
  insert into public.shifts(id, owner_id, company_id, worker_id, role, shift_date, start_time, end_time, rate, status, clock_in, clock_out, break_mins, approved) values
    -- this week
    ('s_jamie_today', p_uid, 'oak', 'jamie', 'Floor',   current_date,            '14:00','22:00', 12.60, 'scheduled', null, null, 30, false),
    ('s_priya_today', p_uid, 'oak', 'priya', 'Bar',     current_date,            '10:00','18:00', 12.60, 'active',    '09:58', null, 30, false),
    ('s_tom_today',   p_uid, 'oak', 'tom',   'Kitchen', current_date,            '12:00','20:00', 13.40, 'active',    '12:03', null, 30, false),
    ('s_mia_today',   p_uid, 'oak', 'mia',   'Floor',   current_date,            '09:00','15:00', 11.60, 'active',    '08:55', null, 30, false),
    ('s_sara_today',  p_uid, 'oak', 'sara',  'Bar',     current_date,            '17:00','23:30', 14.20, 'scheduled', null, null, 30, false),
    ('open_oak_1',    p_uid, 'oak', null,    'Floor',   monday + 5,              '18:00','23:30', 12.60, 'open',      null, null, 30, false),
    ('open_oak_2',    p_uid, 'oak', null,    'Kitchen', monday + 6,              '11:00','17:00', 13.40, 'open',      null, null, 30, false),
    ('open_bright',   p_uid, 'bright', null, 'Care Assistant', monday + 6,       '07:00','15:00', 13.10, 'open',      null, null, 30, false),
    ('open_metro',    p_uid, 'metro', null,  'Picker / Packer', monday + 4,      '22:00','06:00', 12.85, 'open',      null, null, 30, false),
    -- historic
    ('s_hist_1',      p_uid, 'oak', 'liam',  'Floor',   monday + greatest(today_dow-1,0), '11:00','19:00', 11.60, 'completed', '11:02','19:24', 30, false),
    ('s_hist_2',      p_uid, 'oak', 'priya', 'Bar',     monday + greatest(today_dow-1,0), '17:00','23:00', 12.60, 'completed', '16:55','23:12', 30, false),
    ('s_hist_3',      p_uid, 'oak', 'tom',   'Kitchen', monday + greatest(today_dow-2,0), '10:00','18:00', 13.40, 'completed', '09:48','18:05', 30, false),
    ('s_hist_4',      p_uid, 'oak', 'aisha', 'Kitchen', monday + greatest(today_dow-3,0), '10:00','18:00', 13.40, 'completed', '10:01','18:00', 30, true);

  -- threads
  insert into public.threads(id, owner_id, company_id, worker_id, unread) values
    ('m-jamie', p_uid, 'oak', 'jamie', false),
    ('m-priya', p_uid, 'oak', 'priya', true),
    ('m-tom',   p_uid, 'oak', 'tom',   false),
    ('m-mia',   p_uid, 'oak', 'mia',   true);

  insert into public.messages(owner_id, thread_id, sender, body, ts_label) values
    (p_uid, 'm-jamie','manager','Hi Jamie — can you cover the bar Saturday evening? Shift''s on the open list.','Mon 09:12'),
    (p_uid, 'm-jamie','worker', 'Morning! I''ll take a look and grab it if I can.','Mon 09:40'),
    (p_uid, 'm-priya','worker', 'Running 5 mins late, bus delay — nearly there!','Today 09:53'),
    (p_uid, 'm-tom',  'manager','Great work on the lunch rush yesterday','Yesterday 20:10'),
    (p_uid, 'm-tom',  'worker', 'Cheers! Busy one.','Yesterday 20:22'),
    (p_uid, 'm-mia',  'worker', 'Can I swap my Friday floor shift? Something''s come up.','Today 11:30');
end;
$$;

revoke all on function public.rota_seed_for_user(uuid) from public;
grant execute on function public.rota_seed_for_user(uuid) to authenticated;
