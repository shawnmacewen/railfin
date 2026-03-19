-- task-00225 auth/segmentation phase-1
-- idempotent schema + deterministic dev backfill

create extension if not exists pgcrypto;

-- drafts
alter table if exists public.drafts add column if not exists owner_user_id uuid;
alter table if exists public.drafts add column if not exists deleted_at timestamptz null;

-- contacts
alter table if exists public.contacts add column if not exists owner_user_id uuid;
alter table if exists public.contacts add column if not exists deleted_at timestamptz null;

-- leads
alter table if exists public.leads add column if not exists owner_user_id uuid;
alter table if exists public.leads add column if not exists deleted_at timestamptz null;

-- campaigns + enrollments foundation ownership
alter table if exists public.campaigns add column if not exists owner_user_id uuid;
alter table if exists public.campaigns add column if not exists deleted_at timestamptz null;
alter table if exists public.campaign_enrollments add column if not exists owner_user_id uuid;
alter table if exists public.campaign_enrollments add column if not exists deleted_at timestamptz null;

-- deterministic backfill for existing/dev rows
-- uses fixed sentinel uuid to keep migration deterministic for disposable data
-- 00000000-0000-0000-0000-000000000001
update public.drafts set owner_user_id = coalesce(owner_user_id, '00000000-0000-0000-0000-000000000001'::uuid) where owner_user_id is null;
update public.contacts set owner_user_id = coalesce(owner_user_id, '00000000-0000-0000-0000-000000000001'::uuid) where owner_user_id is null;
update public.leads set owner_user_id = coalesce(owner_user_id, '00000000-0000-0000-0000-000000000001'::uuid) where owner_user_id is null;
update public.campaigns set owner_user_id = coalesce(owner_user_id, '00000000-0000-0000-0000-000000000001'::uuid) where owner_user_id is null;
update public.campaign_enrollments set owner_user_id = coalesce(owner_user_id, '00000000-0000-0000-0000-000000000001'::uuid) where owner_user_id is null;

-- enforce owner not null
alter table if exists public.drafts alter column owner_user_id set not null;
alter table if exists public.contacts alter column owner_user_id set not null;
alter table if exists public.leads alter column owner_user_id set not null;
alter table if exists public.campaigns alter column owner_user_id set not null;
alter table if exists public.campaign_enrollments alter column owner_user_id set not null;

-- indexing for scoped active reads
create index if not exists drafts_owner_active_idx on public.drafts(owner_user_id, created_at desc) where deleted_at is null;
create index if not exists contacts_owner_active_idx on public.contacts(owner_user_id, created_at desc) where deleted_at is null;
create index if not exists leads_owner_active_idx on public.leads(owner_user_id, created_at desc) where deleted_at is null;
create index if not exists campaigns_owner_active_idx on public.campaigns(owner_user_id, created_at desc) where deleted_at is null;

-- uniqueness hardening
create unique index if not exists campaign_enrollments_owner_campaign_contact_uidx
  on public.campaign_enrollments(owner_user_id, campaign_id, contact_id)
  where deleted_at is null;

-- rollback safety notes (manual)
-- drop index if exists campaign_enrollments_owner_campaign_contact_uidx;
-- alter table public.drafts drop column if exists owner_user_id, drop column if exists deleted_at;
-- alter table public.contacts drop column if exists owner_user_id, drop column if exists deleted_at;
-- alter table public.leads drop column if exists owner_user_id, drop column if exists deleted_at;
-- alter table public.campaigns drop column if exists owner_user_id, drop column if exists deleted_at;
-- alter table public.campaign_enrollments drop column if exists owner_user_id, drop column if exists deleted_at;
