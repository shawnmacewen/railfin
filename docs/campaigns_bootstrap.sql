-- task-00207 Campaigns module phase-1 foundation bootstrap
-- Apply manually in Supabase SQL editor or psql.

create table if not exists public.campaigns (
  id text primary key,
  owner_user_id uuid not null,
  name text not null,
  objective text,
  status text not null check (status in ('draft', 'active', 'paused', 'archived')),
  targeting_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz null
);

create table if not exists public.campaign_sequences (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  name text not null,
  sequence_order integer not null check (sequence_order >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_steps (
  id text primary key,
  sequence_id text not null references public.campaign_sequences(id) on delete cascade,
  step_order integer not null check (step_order >= 0),
  step_type text not null check (step_type in ('email', 'wait', 'condition')),
  email_subject text,
  email_body text,
  wait_minutes integer,
  condition_operator text check (condition_operator in ('if', 'or')),
  condition_rules_json jsonb,
  yes_sequence_id text,
  no_sequence_id text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint campaign_steps_email_shape check (
    (step_type <> 'email')
    or (email_subject is not null and email_body is not null)
  ),
  constraint campaign_steps_wait_shape check (
    (step_type <> 'wait')
    or (wait_minutes is not null and wait_minutes >= 1)
  ),
  constraint campaign_steps_condition_shape check (
    (step_type <> 'condition')
    or (
      condition_operator is not null
      and condition_rules_json is not null
      and yes_sequence_id is not null
      and no_sequence_id is not null
    )
  )
);

create table if not exists public.campaign_enrollments (
  id text primary key,
  owner_user_id uuid not null,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  contact_id text not null,
  enrollment_status text not null check (enrollment_status in ('pending', 'active', 'paused', 'completed', 'exited')),
  active_sequence_id text,
  active_step_id text,
  next_eligible_at timestamptz,
  enrolled_at timestamptz not null default timezone('utc', now()),
  last_transition_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz null,
  constraint campaign_enrollments_owner_campaign_contact_unique unique (owner_user_id, campaign_id, contact_id)
);

create table if not exists public.campaign_enrollment_events (
  id text primary key,
  enrollment_id text not null references public.campaign_enrollments(id) on delete cascade,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('manual', 'engine', 'system')),
  details_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_social_posts (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'x', 'facebook', 'instagram')),
  status text not null check (status in ('draft', 'scheduled', 'published', 'cancelled')),
  content text not null,
  scheduled_for timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_calendar_items (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  item_type text not null check (item_type in ('social_post', 'email_send', 'event_trigger', 'manual_task')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  title text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contacts (
  id text primary key,
  full_name text not null,
  primary_email text not null,
  primary_phone text,
  source text,
  lead_stage text not null check (lead_stage in ('new', 'contacted', 'qualified', 'closed')),
  lead_score integer,
  owner_user_id uuid not null,
  tags text[] not null default '{}',
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz null
);

create table if not exists public.segments (
  id text primary key,
  name text not null,
  description text,
  rule_json jsonb not null,
  is_dynamic boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists campaigns_created_at_idx on public.campaigns(created_at desc);
create index if not exists campaign_sequences_campaign_id_idx on public.campaign_sequences(campaign_id, sequence_order);
create index if not exists campaign_steps_sequence_id_idx on public.campaign_steps(sequence_id, step_order);
create index if not exists campaign_enrollments_campaign_id_idx on public.campaign_enrollments(campaign_id, enrollment_status);
create index if not exists campaign_enrollments_contact_id_idx on public.campaign_enrollments(contact_id);
create index if not exists campaign_enrollments_next_eligible_at_idx on public.campaign_enrollments(next_eligible_at);
create index if not exists campaign_enrollment_events_enrollment_id_idx on public.campaign_enrollment_events(enrollment_id, created_at);
create index if not exists campaign_social_posts_campaign_id_idx on public.campaign_social_posts(campaign_id, status);
create index if not exists campaign_calendar_items_campaign_id_idx on public.campaign_calendar_items(campaign_id, starts_at);
create index if not exists contacts_email_idx on public.contacts(lower(primary_email));
create index if not exists contacts_lead_stage_idx on public.contacts(lead_stage);
create index if not exists segments_dynamic_idx on public.segments(is_dynamic);
