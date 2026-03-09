-- task-00211 manual backfill: leads -> contacts
-- Idempotent: safe to run multiple times.

create table if not exists public.contacts (
  id text primary key,
  full_name text not null,
  primary_email text not null,
  primary_phone text,
  source text,
  stage text not null check (stage in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists contacts_created_at_idx on public.contacts(created_at desc);
create index if not exists contacts_email_idx on public.contacts(lower(primary_email));
create index if not exists contacts_stage_idx on public.contacts(stage);
create index if not exists contacts_source_idx on public.contacts(source);

create or replace function public.contacts_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists contacts_touch_updated_at on public.contacts;
create trigger contacts_touch_updated_at
before update on public.contacts
for each row execute function public.contacts_touch_updated_at();

insert into public.contacts (id, full_name, primary_email, primary_phone, source, stage, created_at)
select l.id, l.name, l.email, l.phone, l.source, l.status, l.created_at
from public.leads l
on conflict (id) do update
set
  full_name = excluded.full_name,
  primary_email = excluded.primary_email,
  primary_phone = excluded.primary_phone,
  source = excluded.source,
  stage = excluded.stage,
  created_at = excluded.created_at,
  updated_at = timezone('utc', now());

-- verification queries
select count(*) as leads_count from public.leads;
select count(*) as contacts_count from public.contacts;

select l.id
from public.leads l
left join public.contacts c on c.id = l.id
where c.id is null
limit 25;
