import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeadStatus } from "./leads";
import type { DataScope } from "./scope";

export type ContactStage = LeadStatus;

export type Contact = {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhone: string | null;
  source: string | null;
  stage: ContactStage;
  createdAt: string;
  updatedAt: string;
};

type ContactRow = {
  id: string;
  full_name: string;
  primary_email: string;
  primary_phone: string | null;
  source: string | null;
  stage: ContactStage;
  created_at: string;
  updated_at: string;
};

export type ContactPersistenceBlocked = {
  kind: "BLOCKED";
  error: string;
  missingEnv?: string[];
  requiredSql?: string;
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export const CONTACTS_REQUIRED_SQL = `create table if not exists public.contacts (
  id text primary key,
  owner_id text not null,
  tenant_id text not null,
  full_name text not null,
  primary_email text not null,
  primary_phone text,
  source text,
  stage text not null check (stage in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists contacts_owner_created_at_idx on public.contacts(owner_id, created_at desc);
create index if not exists contacts_tenant_created_at_idx on public.contacts(tenant_id, created_at desc);
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
for each row execute function public.contacts_touch_updated_at();`;

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: ContactPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missingEnv.length > 0) {
    return {
      ok: false,
      blocked: {
        kind: "BLOCKED",
        error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`,
        missingEnv,
        requiredSql: CONTACTS_REQUIRED_SQL,
      },
    };
  }

  return {
    ok: true,
    client: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

function blockedFromError(error: { code?: string | null } | null): ContactPersistenceBlocked {
  const suffix = error?.code === "42P01"
    ? " Root cause: public.contacts table is missing in the connected database."
    : error?.code === "42501"
      ? " Root cause: service role lacks required permission on public.contacts."
      : error?.code
        ? ` Root cause code: ${error.code}.`
        : "";

  return {
    kind: "BLOCKED",
    error: `Contact persistence blocked: unable to access public.contacts.${suffix}`,
    requiredSql: CONTACTS_REQUIRED_SQL,
  };
}

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    fullName: row.full_name,
    primaryEmail: row.primary_email,
    primaryPhone: row.primary_phone,
    source: row.source,
    stage: row.stage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createContactInTable(input: {
  fullName: string;
  primaryEmail: string;
  primaryPhone: string | null;
  source: string | null;
  stage: ContactStage;
  scope: DataScope;
}): Promise<{ ok: true; contact: Contact } | { ok: false; blocked: ContactPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("contacts")
    .insert({ id: randomUUID(), owner_id: input.scope.ownerId, tenant_id: input.scope.tenantId, full_name: input.fullName, primary_email: input.primaryEmail, primary_phone: input.primaryPhone, source: input.source, stage: input.stage })
    .select("id, full_name, primary_email, primary_phone, source, stage, created_at, updated_at")
    .single();

  if (error || !data) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, contact: mapContact(data as ContactRow) };
}

export async function updateContactInTable(input: {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhone: string | null;
  source: string | null;
  stage: ContactStage;
  scope: DataScope;
}): Promise<{ ok: true; contact: Contact | null } | { ok: false; blocked: ContactPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("contacts")
    .update({ full_name: input.fullName, primary_email: input.primaryEmail, primary_phone: input.primaryPhone, source: input.source, stage: input.stage })
    .eq("id", input.id)
    .eq("owner_id", input.scope.ownerId)
    .eq("tenant_id", input.scope.tenantId)
    .select("id, full_name, primary_email, primary_phone, source, stage, created_at, updated_at")
    .maybeSingle();

  if (error) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, contact: data ? mapContact(data as ContactRow) : null };
}

export async function getContactFromTable(id: string, scope: DataScope): Promise<{ ok: true; contact: Contact | null } | { ok: false; blocked: ContactPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("contacts")
    .select("id, full_name, primary_email, primary_phone, source, stage, created_at, updated_at")
    .eq("id", id)
    .eq("owner_id", scope.ownerId)
    .eq("tenant_id", scope.tenantId)
    .maybeSingle();

  if (error) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, contact: data ? mapContact(data as ContactRow) : null };
}

export async function deleteContactFromTable(id: string, scope: DataScope): Promise<{ ok: true; deleted: boolean } | { ok: false; blocked: ContactPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("owner_id", scope.ownerId)
    .eq("tenant_id", scope.tenantId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, deleted: Boolean(data?.id) };
}

export async function listContactsFromTable(scope: DataScope): Promise<{ ok: true; contacts: Contact[] } | { ok: false; blocked: ContactPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("contacts")
    .select("id, full_name, primary_email, primary_phone, source, stage, created_at, updated_at")
    .eq("owner_id", scope.ownerId)
    .eq("tenant_id", scope.tenantId)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, contacts: (data ?? []).map((row) => mapContact(row as ContactRow)) };
}
