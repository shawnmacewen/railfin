-- task-00225 phase-1 auth + user/tenant segmentation foundation
-- Idempotent migration + deterministic backfill

-- 1) Core ownership columns
alter table if exists public.drafts add column if not exists owner_id text;
alter table if exists public.drafts add column if not exists tenant_id text;

alter table if exists public.contacts add column if not exists owner_id text;
alter table if exists public.contacts add column if not exists tenant_id text;

alter table if exists public.leads add column if not exists owner_id text;
alter table if exists public.leads add column if not exists tenant_id text;

-- 2) Deterministic backfill for pre-existing rows
update public.drafts
set owner_id = coalesce(nullif(owner_id, ''), 'legacy-owner'),
    tenant_id = coalesce(nullif(tenant_id, ''), 'legacy-tenant')
where owner_id is null or owner_id = '' or tenant_id is null or tenant_id = '';

update public.contacts
set owner_id = coalesce(nullif(owner_id, ''), 'legacy-owner'),
    tenant_id = coalesce(nullif(tenant_id, ''), 'legacy-tenant')
where owner_id is null or owner_id = '' or tenant_id is null or tenant_id = '';

update public.leads
set owner_id = coalesce(nullif(owner_id, ''), 'legacy-owner'),
    tenant_id = coalesce(nullif(tenant_id, ''), 'legacy-tenant')
where owner_id is null or owner_id = '' or tenant_id is null or tenant_id = '';

-- 3) Enforce not-null after backfill
alter table if exists public.drafts alter column owner_id set not null;
alter table if exists public.drafts alter column tenant_id set not null;

alter table if exists public.contacts alter column owner_id set not null;
alter table if exists public.contacts alter column tenant_id set not null;

alter table if exists public.leads alter column owner_id set not null;
alter table if exists public.leads alter column tenant_id set not null;

-- 4) Indexes for scoped reads
create index if not exists drafts_owner_created_idx on public.drafts(owner_id, created_at desc);
create index if not exists drafts_tenant_created_idx on public.drafts(tenant_id, created_at desc);

create index if not exists contacts_owner_created_at_idx on public.contacts(owner_id, created_at desc);
create index if not exists contacts_tenant_created_at_idx on public.contacts(tenant_id, created_at desc);

create index if not exists leads_owner_created_at_idx on public.leads(owner_id, created_at desc);
create index if not exists leads_tenant_created_at_idx on public.leads(tenant_id, created_at desc);

-- 5) Optional rollback (manual)
-- alter table public.drafts drop column if exists owner_id, drop column if exists tenant_id;
-- alter table public.contacts drop column if exists owner_id, drop column if exists tenant_id;
-- alter table public.leads drop column if exists owner_id, drop column if exists tenant_id;
