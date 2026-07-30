-- BOVAS logistics schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create type public.app_role as enum (
  'logistics',
  'admin',
  'dispatch',
  'safety'
);

create type public.ticket_status as enum (
  'approved',
  'pending',
  'rejected'
);

create type public.truck_type as enum (
  'Internal',
  'Marketer',
  'Industrial'
);

create type public.product_type as enum (
  'PMS',
  'AGO',
  'DPK'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'logistics',
  created_at timestamptz not null default now()
);

create table public.loading_tickets (
  id text primary key,
  customer text not null,
  truck_type public.truck_type not null,
  truck_number text not null,
  product public.product_type not null,
  quantity integer not null check (quantity > 0),
  destination text not null,
  status public.ticket_status not null default 'pending',
  terminal text,
  requested_amount text,
  marketer text,
  representative text,
  phone text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id)
);

create table public.ticket_destinations (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references public.loading_tickets (id) on delete cascade,
  station text not null,
  amount text not null,
  address text not null
);

create table public.marketer_stats (
  id uuid primary key default gen_random_uuid(),
  marketer text not null,
  trucks integer not null default 0,
  quantity_requested integer not null default 0,
  recorded_on date not null default current_date,
  unique (marketer, recorded_on)
);

create index loading_tickets_status_idx on public.loading_tickets (status);
create index loading_tickets_created_at_idx on public.loading_tickets (created_at desc);
create index ticket_destinations_ticket_id_idx on public.ticket_destinations (ticket_id);

-- Auto-create a profile when a user signs up / is invited
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'logistics')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.loading_tickets enable row level security;
alter table public.ticket_destinations enable row level security;
alter table public.marketer_stats enable row level security;

-- Authenticated staff can read shared ops data (tighten per-role later)
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "loading_tickets: read authenticated"
  on public.loading_tickets for select
  to authenticated
  using (true);

create policy "loading_tickets: insert logistics/admin"
  on public.loading_tickets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('logistics', 'admin')
    )
  );

create policy "loading_tickets: update staff"
  on public.loading_tickets for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('logistics', 'admin', 'dispatch', 'safety')
    )
  );

create policy "ticket_destinations: read authenticated"
  on public.ticket_destinations for select
  to authenticated
  using (true);

create policy "marketer_stats: read authenticated"
  on public.marketer_stats for select
  to authenticated
  using (true);
