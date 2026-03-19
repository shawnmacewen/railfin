import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { DataScope } from "./scope";

type DraftRow = {
  id: string;
  owner_user_id: string;
  title: string;
  body: string;
  metadata: unknown;
  history: unknown;
  created_at: string;
  deleted_at: string | null;
};

export type Draft = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type DraftPersistenceBlocked = {
  kind: "BLOCKED";
  error: string;
  missingEnv?: string[];
  requiredSql?: string;
};

export type DraftListQuery = { q?: string; limit?: number; offset?: number };
export type DraftListResult = { items: Draft[]; total: number; limit: number; offset: number; q: string };

export type DraftRemediationAuditEvent = {
  id: string;
  type: "apply" | "undo";
  timestampUtc: string;
  actor: string;
  draftContextId: string;
  findingId: string;
  beforeHash: string;
  afterHash: string;
  changedChars: number;
  changedLines: number;
  outcome: "applied" | "undone" | "failed";
  undoLinkId?: string;
  context?: { source?: string; sessionScope?: string };
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

const REQUIRED_SQL = `create extension if not exists pgcrypto;
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz null
);
create index if not exists drafts_owner_created_idx on public.drafts(owner_user_id, created_at desc);
create index if not exists drafts_owner_deleted_idx on public.drafts(owner_user_id, deleted_at);`;

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 100;

function blocked(error: string, requiredSql = REQUIRED_SQL): DraftPersistenceBlocked {
  return { kind: "BLOCKED", error, requiredSql };
}

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: DraftPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missingEnv.length > 0) {
    return { ok: false, blocked: { kind: "BLOCKED", error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`, missingEnv, requiredSql: REQUIRED_SQL } };
  }

  return {
    ok: true,
    client: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

function mapDraftRow(row: DraftRow): Draft {
  return { id: row.id, title: row.title, body: row.body, createdAt: row.created_at };
}

function normalizeListQuery(query: DraftListQuery): Required<DraftListQuery> {
  return {
    q: (query.q ?? "").trim(),
    limit: Math.min(MAX_LIST_LIMIT, Math.max(1, Number.isFinite(query.limit) ? Math.floor(query.limit as number) : DEFAULT_LIST_LIMIT)),
    offset: Math.max(0, Number.isFinite(query.offset) ? Math.floor(query.offset as number) : 0),
  };
}

export async function createDraftInTable(input: { title?: string; body?: string; scope: DataScope }) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const { data, error } = await client.client
    .from("drafts")
    .insert({ id: randomUUID(), owner_user_id: input.scope.ownerUserId, title: input.title ?? "Untitled Draft", body: input.body ?? "", deleted_at: null })
    .select("id, owner_user_id, title, body, metadata, history, created_at, deleted_at")
    .single();

  if (error || !data) return { ok: false as const, blocked: blocked("Draft persistence blocked: unable to write to public.drafts.") };
  return { ok: true as const, draft: mapDraftRow(data as DraftRow) };
}

export async function readDraftFromTable(id: string, scope: DataScope) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const { data, error } = await client.client
    .from("drafts")
    .select("id, owner_user_id, title, body, metadata, history, created_at, deleted_at")
    .eq("id", id)
    .eq("owner_user_id", scope.ownerUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { ok: false as const, blocked: blocked("Draft persistence blocked: unable to read from public.drafts.") };
  return { ok: true as const, draft: data ? mapDraftRow(data as DraftRow) : null };
}

export async function listDraftsFromTable(query: DraftListQuery, scope: DataScope) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const normalized = normalizeListQuery(query);

  let statement = client.client
    .from("drafts")
    .select("id, owner_user_id, title, body, metadata, history, created_at, deleted_at", { count: "exact" })
    .eq("owner_user_id", scope.ownerUserId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(normalized.offset, normalized.offset + normalized.limit - 1);

  if (normalized.q) {
    statement = statement.or(`title.ilike.%${normalized.q}%,body.ilike.%${normalized.q}%`);
  }

  const { data, error, count } = await statement;
  if (error) return { ok: false as const, blocked: blocked("Draft persistence blocked: unable to list from public.drafts.") };

  return {
    ok: true as const,
    result: {
      items: (data ?? []).map((row) => mapDraftRow(row as DraftRow)),
      total: count ?? 0,
      limit: normalized.limit,
      offset: normalized.offset,
      q: normalized.q,
    },
  };
}

export async function appendDraftRemediationAuditEvent(input: { draftId: string; event: DraftRemediationAuditEvent; scope: DataScope }) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const { data, error } = await client.client
    .from("drafts")
    .select("metadata, history")
    .eq("id", input.draftId)
    .eq("owner_user_id", input.scope.ownerUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { ok: false as const, blocked: blocked("Draft persistence blocked: unable to read audit context.") };
  if (!data) return { ok: true as const };

  const metadata = data.metadata && typeof data.metadata === "object" ? (data.metadata as Record<string, unknown>) : {};
  const history = Array.isArray(data.history) ? data.history : [];
  const nextMetadata = { ...metadata, remediationAudit: { lastEventId: input.event.id, lastEventAt: input.event.timestampUtc, lastOutcome: input.event.outcome } };
  const nextHistory = [...history, input.event].slice(-200);

  const { error: updateError } = await client.client
    .from("drafts")
    .update({ metadata: nextMetadata, history: nextHistory })
    .eq("id", input.draftId)
    .eq("owner_user_id", input.scope.ownerUserId)
    .is("deleted_at", null);

  if (updateError) return { ok: false as const, blocked: blocked("Draft persistence blocked: unable to write audit event.") };
  return { ok: true as const };
}

export const DRAFTS_REQUIRED_SQL = REQUIRED_SQL;
export const DRAFTS_REQUIRED_ENV = [...REQUIRED_ENV];
