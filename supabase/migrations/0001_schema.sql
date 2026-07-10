-- ============================================================
-- ShiftPilot — initial schema
-- Run with: supabase db push   (or paste into SQL editor)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- profiles ----------
-- One row per auth user. inbound_token builds the user's private
-- email-forwarding address: <token>@in.yourdomain.com
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  default_buffer_mins int not null default 30,
  default_travel_mode text not null default 'driving'
    check (default_travel_mode in ('driving','transit','bicycling','walking')),
  inbound_token text not null unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- saved starting points (multi-home profiles) ----------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,                      -- "Home", "City Centre Flat"
  address text not null,
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index locations_user_idx on public.locations (user_id);

-- ---------- shifts ----------
create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  venue_name text not null,
  address text not null,
  lat double precision,
  lng double precision,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  pay_rate numeric(10,2),
  pay_type text check (pay_type in ('hourly','flat')),
  origin_location_id uuid references public.locations (id) on delete set null,
  travel_mode text not null default 'driving'
    check (travel_mode in ('driving','transit','bicycling','walking')),
  reminder_offset_mins int not null default 1440,   -- 1 day before
  buffer_mins int not null default 30,

  -- 'pending_review' = created by the email parser, awaiting user confirm
  status text not null default 'confirmed'
    check (status in ('pending_review','confirmed','completed','cancelled')),
  source text not null default 'manual'
    check (source in ('manual','email','template','ical')),

  -- written by the leave-by engine
  travel_duration_secs int,
  leave_by_at timestamptz,
  traffic_checked_at timestamptz,
  leave_alert_sent boolean not null default false,

  raw_email text,                            -- original email body, for audit
  created_at timestamptz not null default now(),
  constraint shift_times_valid check (ends_at > starts_at)
);
create index shifts_user_start_idx on public.shifts (user_id, starts_at);
create index shifts_upcoming_idx on public.shifts (starts_at)
  where status = 'confirmed' and leave_alert_sent = false;

-- Overlap check used by the app for conflict warnings (warn, don't block)
create or replace function public.find_conflicts(
  p_user uuid, p_start timestamptz, p_end timestamptz, p_exclude uuid default null
) returns setof public.shifts language sql stable as $$
  select * from public.shifts s
  where s.user_id = p_user
    and s.status in ('confirmed','pending_review')
    and (p_exclude is null or s.id <> p_exclude)
    and tstzrange(s.starts_at, s.ends_at) && tstzrange(p_start, p_end);
$$;

-- ---------- templates ----------
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,                       -- "Night shift — Hospital X"
  company text not null,
  venue_name text not null,
  address text not null,
  lat double precision,
  lng double precision,
  duration_mins int not null default 480,
  notes text,
  pay_rate numeric(10,2),
  pay_type text check (pay_type in ('hourly','flat')),
  created_at timestamptz not null default now()
);
create index templates_user_idx on public.templates (user_id);

-- ---------- expenses ----------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  shift_id uuid references public.shifts (id) on delete cascade,
  kind text not null check (kind in ('mileage','parking','meal','other')),
  amount numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);
create index expenses_user_idx on public.expenses (user_id);

-- ---------- push tokens ----------
create table public.push_tokens (
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  primary key (user_id, expo_push_token)
);

-- ============================================================
-- Row Level Security: every user sees only their own rows
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.locations   enable row level security;
alter table public.shifts      enable row level security;
alter table public.templates   enable row level security;
alter table public.expenses    enable row level security;
alter table public.push_tokens enable row level security;

create policy "own profile"   on public.profiles    for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own locations" on public.locations   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own shifts"    on public.shifts      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own templates" on public.templates   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own expenses"  on public.expenses    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tokens"    on public.push_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Edge functions use the service-role key and bypass RLS by design.
