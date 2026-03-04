import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  createdAt: string;
};

export type LeadPersistenceBlocked = {
  kind: "BLOCKED";
  error: string;
  missingEnv?: string[];
  requiredSql?: string;
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export const LEADS_REQUIRED_SQL = `create table if not exists public.leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx on public.leads(lower(email));`;

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: LeadPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missingEnv.length > 0) {
    return {
      ok: false,
      blocked: {
        kind: "BLOCKED",
        error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`,
        missingEnv,
        requiredSql: LEADS_REQUIRED_SQL,
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

function blockedFromError(error: { code?: string | null } | null): LeadPersistenceBlocked {
  const suffix = error?.code === "42P01"
    ? " Root cause: public.leads table is missing in the connected database."
    : error?.code === "42501"
      ? " Root cause: service role lacks required permission on public.leads."
      : error?.code
        ? ` Root cause code: ${error.code}.`
        : "";

  return {
    kind: "BLOCKED",
    error: `Lead persistence blocked: unable to access public.leads.${suffix}`,
    requiredSql: LEADS_REQUIRED_SQL,
  };
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createLeadInTable(input: {
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
}): Promise<{ ok: true; lead: Lead } | { ok: false; blocked: LeadPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("leads")
    .insert({ id: randomUUID(), ...input })
    .select("id, name, email, phone, source, status, created_at")
    .single();

  if (error || !data) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, lead: mapLead(data as LeadRow) };
}

export async function listLeadsFromTable(): Promise<{ ok: true; leads: Lead[] } | { ok: false; blocked: LeadPersistenceBlocked }> {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false, blocked: client.blocked };

  const { data, error } = await client.client
    .from("leads")
    .select("id, name, email, phone, source, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return { ok: false, blocked: blockedFromError(error) };
  return { ok: true, leads: (data ?? []).map((row) => mapLead(row as LeadRow)) };
}
