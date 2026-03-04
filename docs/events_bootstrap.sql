-- Railfin Events v0.2 phase-1 Supabase bootstrap
-- Task: task-00184
-- Safe to run multiple times (IF NOT EXISTS guards).

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 140),
  date timestamptz not null,
  summary text not null check (char_length(summary) <= 2000),
  location text not null check (char_length(location) <= 160),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 320),
  phone text null check (phone is null or char_length(phone) <= 32),
  attendance_intent text not null check (attendance_intent in ('attending', 'not-attending', 'unsure')),
  created_at timestamptz not null default now()
);

create table if not exists public.event_registration_intents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid null references public.events(id) on delete set null,
  name text null check (name is null or char_length(name) <= 120),
  email text null check (email is null or char_length(email) <= 320),
  phone text null check (phone is null or char_length(phone) <= 32),
  attendance_intent text null check (attendance_intent is null or attendance_intent in ('attending', 'not-attending', 'unsure')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_date on public.events (date);
create index if not exists idx_events_status_date on public.events (status, date);
create index if not exists idx_event_registrations_event_id on public.event_registrations (event_id);
create index if not exists idx_event_registrations_event_id_created_at on public.event_registrations (event_id, created_at);
create index if not exists idx_event_registration_intents_event_id on public.event_registration_intents (event_id);
create index if not exists idx_event_registration_intents_created_at on public.event_registration_intents (created_at);
