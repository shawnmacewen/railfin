import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { DataScope } from "./scope";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

type LeadRow = {
  id: string;
  owner_user_id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  created_at: string;
  deleted_at: string | null;
};

export type Lead = { id: string; name: string; email: string; phone: string | null; source: string | null; status: LeadStatus; createdAt: string };

export type LeadPersistenceBlocked = { kind: "BLOCKED"; error: string; missingEnv?: string[]; requiredSql?: string };

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export const LEADS_REQUIRED_SQL = `create extension if not exists pgcrypto;
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null,
  email text not null,
  phone text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz null
);
create index if not exists leads_owner_created_at_idx on public.leads(owner_user_id, created_at desc);
create index if not exists leads_owner_deleted_idx on public.leads(owner_user_id, deleted_at);
create index if not exists leads_email_idx on public.leads(lower(email));`;

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: LeadPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missingEnv.length > 0) {
    return { ok: false, blocked: { kind: "BLOCKED", error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`, missingEnv, requiredSql: LEADS_REQUIRED_SQL } };
  }

  return { ok: true, client: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

function mapLead(row: LeadRow): Lead {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, source: row.source, status: row.status, createdAt: row.created_at };
}

export async function createLeadInTable(input: { name: string; email: string; phone: string | null; source: string | null; status: LeadStatus; scope: DataScope }) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const { data, error } = await client.client
    .from("leads")
    .insert({ id: randomUUID(), owner_user_id: input.scope.ownerUserId, name: input.name, email: input.email, phone: input.phone, source: input.source, status: input.status, deleted_at: null })
    .select("id, owner_user_id, name, email, phone, source, status, created_at, deleted_at")
    .single();

  if (error || !data) return { ok: false as const, blocked: { kind: "BLOCKED", error: "Lead persistence blocked: unable to access public.leads.", requiredSql: LEADS_REQUIRED_SQL } };
  return { ok: true as const, lead: mapLead(data as LeadRow) };
}

export async function listLeadsFromTable(scope: DataScope) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const { data, error } = await client.client
    .from("leads")
    .select("id, owner_user_id, name, email, phone, source, status, created_at, deleted_at")
    .eq("owner_user_id", scope.ownerUserId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, blocked: { kind: "BLOCKED", error: "Lead persistence blocked: unable to access public.leads.", requiredSql: LEADS_REQUIRED_SQL } };
  return { ok: true as const, leads: (data ?? []).map((row) => mapLead(row as LeadRow)) };
}
