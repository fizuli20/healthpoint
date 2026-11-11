-- HealthPoint PostgreSQL Schema & Row-Level Security Migration
-- Target: Dedicated Supabase Postgres database for HealthPoint

create extension if not exists "pgcrypto";

-- 1. Core tables
create table if not exists public.access_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  neighborhood text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  operational_status text not null check (operational_status in ('operational', 'limited', 'unavailable', 'unknown')),
  equipment text[] not null default '{}',
  wheelchair_accessible boolean not null default false,
  audio_guided boolean not null default false,
  open_24_7 boolean not null default false,
  opening_hours text not null default '08:00 - 22:00',
  last_verified_at timestamptz not null default now(),
  image_url text,
  is_demo boolean not null default true,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  preferred_language text not null default 'az' check (preferred_language in ('az', 'en', 'ru')),
  accessibility_preferences jsonb not null default '{"easyAccessMode":false,"fontSize":"normal","highContrast":false,"reducedMotion":false,"simpleLanguage":false}'::jsonb,
  notifications_enabled boolean not null default true,
  share_location_history boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  access_point_id uuid not null references public.access_points(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, access_point_id)
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null check (char_length(trim(contact_name)) > 0),
  phone_number text not null check (char_length(trim(phone_number)) >= 5),
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_reports (
  id uuid primary key default gen_random_uuid(),
  access_point_id uuid not null references public.access_points(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  issue_type text not null check (issue_type in ('broken_equipment', 'incorrect_location', 'accessibility_issue', 'closed_unavailable', 'damaged_infrastructure', 'other')),
  description text not null check (char_length(trim(description)) >= 5 and char_length(description) <= 2000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'operator')),
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.maintenance_reports(id) on delete cascade,
  assigned_to text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  notes text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2. Timestamp & helper triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_access_points_updated on public.access_points;
create trigger trg_access_points_updated
before update on public.access_points
for each row execute function public.set_updated_at();

drop trigger if exists trg_reports_updated on public.maintenance_reports;
create trigger trg_reports_updated
before update on public.maintenance_reports
for each row execute function public.set_updated_at();

create or replace function public.is_healthpoint_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = uid and role in ('admin', 'operator')
  );
$$;

-- Auto-create profile row for newly registered auth users
create or replace function public.handle_new_healthpoint_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_healthpoint on auth.users;
create trigger on_auth_user_created_healthpoint
after insert on auth.users
for each row execute function public.handle_new_healthpoint_user();

-- 3. Row-Level Security (RLS)
alter table public.access_points enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_points enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.maintenance_reports enable row level security;
alter table public.admin_roles enable row level security;
alter table public.maintenance_tasks enable row level security;

-- access_points: public read, admin write
create policy "Public can read access_points"
  on public.access_points for select
  using (true);

create policy "Admins can insert access_points"
  on public.access_points for insert
  to authenticated
  with check (public.is_healthpoint_admin(auth.uid()));

create policy "Admins can update access_points"
  on public.access_points for update
  to authenticated
  using (public.is_healthpoint_admin(auth.uid()))
  with check (public.is_healthpoint_admin(auth.uid()));

create policy "Admins can delete access_points"
  on public.access_points for delete
  to authenticated
  using (public.is_healthpoint_admin(auth.uid()));

-- profiles: owner read/write only
create policy "Users manage own profile"
  on public.profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- saved_points: owner read/write only
create policy "Users manage own saved_points"
  on public.saved_points for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- emergency_contacts: strictly private to owner
create policy "Users manage own emergency_contacts"
  on public.emergency_contacts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- maintenance_reports: anyone can submit valid reports; admins inspect/manage; submitter sees own
create policy "Anyone can submit maintenance_reports"
  on public.maintenance_reports for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "Admins or owner can read maintenance_reports"
  on public.maintenance_reports for select
  to authenticated
  using (public.is_healthpoint_admin(auth.uid()) or user_id = auth.uid());

create policy "Admins can update maintenance_reports"
  on public.maintenance_reports for update
  to authenticated
  using (public.is_healthpoint_admin(auth.uid()))
  with check (public.is_healthpoint_admin(auth.uid()));

-- admin_roles: user can check own role only
create policy "Users can view own admin role"
  on public.admin_roles for select
  to authenticated
  using (user_id = auth.uid());

-- maintenance_tasks: admins only
create policy "Admins manage maintenance_tasks"
  on public.maintenance_tasks for all
  to authenticated
  using (public.is_healthpoint_admin(auth.uid()))
  with check (public.is_healthpoint_admin(auth.uid()));
