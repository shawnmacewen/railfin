-- task-00187 CRM phase-1 bootstrap
-- Apply manually in Supabase SQL editor or psql.

create table if not exists public.leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx on public.leads(lower(email));
