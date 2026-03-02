import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type DraftRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
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

export type DraftListQuery = {
  q?: string;
  limit?: number;
  offset?: number;
};

export type DraftListResult = {
  items: Draft[];
  total: number;
  limit: number;
  offset: number;
  q: string;
};

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

const REQUIRED_SQL = `create table if not exists public.drafts (
  id text primary key,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);`;

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 100;

type DraftOperation = "write" | "read" | "list";
type DraftTableError = { code?: string | null } | null;

function formatErrorContext(error: DraftTableError): string {
  if (!error) {
    return "";
  }

  if (error.code === "42P01") {
    return " Root cause: public.drafts table is missing in the connected database.";
  }

  if (error.code === "42501") {
    return " Root cause: service role lacks required permission on public.drafts.";
  }

  return error.code ? ` Root cause code: ${error.code}.` : "";
}

function blockedTableAccess(operation: DraftOperation, error: DraftTableError): DraftPersistenceBlocked {
  const preposition = operation === "write" ? "to" : "from";

  return {
    kind: "BLOCKED",
    error:
      `Draft persistence blocked: unable to ${operation} ${preposition} public.drafts. Ensure table exists and service role has access.` +
      formatErrorContext(error),
    requiredSql: REQUIRED_SQL,
  };
}

function mapDraftRow(row: DraftRow): Draft {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  };
}

function normalizeListQuery(query: DraftListQuery): Required<DraftListQuery> {
  const normalizedQ = (query.q ?? "").trim();
  const normalizedLimit = Math.min(
    MAX_LIST_LIMIT,
    Math.max(1, Number.isFinite(query.limit) ? Math.floor(query.limit as number) : DEFAULT_LIST_LIMIT),
  );
  const normalizedOffset = Math.max(
    0,
    Number.isFinite(query.offset) ? Math.floor(query.offset as number) : 0,
  );

  return {
    q: normalizedQ,
    limit: normalizedLimit,
    offset: normalizedOffset,
  };
}

function getDraftClientOrBlocked():
  | { ok: true; client: SupabaseClient }
  | { ok: false; blocked: DraftPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missingEnv.length > 0) {
    return {
      ok: false,
      blocked: {
        kind: "BLOCKED",
        error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`,
        missingEnv,
        requiredSql: REQUIRED_SQL,
      },
    };
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return { ok: true, client };
}

export async function createDraftInTable(input: {
  title?: string;
  body?: string;
}): Promise<{ ok: true; draft: Draft } | { ok: false; blocked: DraftPersistenceBlocked }> {
  const draftClient = getDraftClientOrBlocked();
  if (!draftClient.ok) {
    return { ok: false, blocked: draftClient.blocked };
  }

  const payload = {
    id: randomUUID(),
    title: input.title ?? "Untitled Draft",
    body: input.body ?? "",
  };

  const { data, error } = await draftClient.client
    .from("drafts")
    .insert(payload)
    .select("id, title, body, created_at")
    .single();

  if (error || !data) {
    return {
      ok: false,
      blocked: blockedTableAccess("write", error),
    };
  }

  return {
    ok: true,
    draft: mapDraftRow(data as DraftRow),
  };
}

export async function readDraftFromTable(
  id: string,
): Promise<{ ok: true; draft: Draft | null } | { ok: false; blocked: DraftPersistenceBlocked }> {
  const draftClient = getDraftClientOrBlocked();
  if (!draftClient.ok) {
    return { ok: false, blocked: draftClient.blocked };
  }

  const { data, error } = await draftClient.client
    .from("drafts")
    .select("id, title, body, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      blocked: blockedTableAccess("read", error),
    };
  }

  return {
    ok: true,
    draft: data ? mapDraftRow(data as DraftRow) : null,
  };
}

export async function listDraftsFromTable(
  query: DraftListQuery,
): Promise<{ ok: true; result: DraftListResult } | { ok: false; blocked: DraftPersistenceBlocked }> {
  const draftClient = getDraftClientOrBlocked();
  if (!draftClient.ok) {
    return { ok: false, blocked: draftClient.blocked };
  }

  const normalized = normalizeListQuery(query);

  let statement = draftClient.client
    .from("drafts")
    .select("id, title, body, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(normalized.offset, normalized.offset + normalized.limit - 1);

  if (normalized.q) {
    statement = statement.or(`title.ilike.%${normalized.q}%,body.ilike.%${normalized.q}%`);
  }

  const { data, error, count } = await statement;

  if (error) {
    return {
      ok: false,
      blocked: blockedTableAccess("list", error),
    };
  }

  return {
    ok: true,
    result: {
      items: (data ?? []).map((row) => mapDraftRow(row as DraftRow)),
      total: count ?? 0,
      limit: normalized.limit,
      offset: normalized.offset,
      q: normalized.q,
    },
  };
}

export async function appendDraftRemediationAuditEvent(input: {
  draftId: string;
  event: DraftRemediationAuditEvent;
}): Promise<{ ok: true } | { ok: false; blocked: DraftPersistenceBlocked }> {
  const draftClient = getDraftClientOrBlocked();
  if (!draftClient.ok) return { ok: false, blocked: draftClient.blocked };

  const { data, error } = await draftClient.client.from("drafts").select("metadata, history").eq("id", input.draftId).maybeSingle();
  if (error) return { ok: false, blocked: blockedTableAccess("read", error) };
  if (!data) return { ok: true };

  const metadata = data.metadata && typeof data.metadata === "object" ? (data.metadata as Record<string, unknown>) : {};
  const history = Array.isArray(data.history) ? data.history : [];
  const currentRemediationAudit = metadata.remediationAudit && typeof metadata.remediationAudit === "object" ? (metadata.remediationAudit as Record<string, unknown>) : {};

  const nextMetadata = { ...metadata, remediationAudit: { ...currentRemediationAudit, lastEventId: input.event.id, lastEventAt: input.event.timestampUtc, lastOutcome: input.event.outcome } };
  const nextHistory = [...history, input.event].slice(-200);

  const { error: updateError } = await draftClient.client.from("drafts").update({ metadata: nextMetadata, history: nextHistory }).eq("id", input.draftId);
  if (updateError) return { ok: false, blocked: blockedTableAccess("write", updateError) };
  return { ok: true };
}

export const DRAFTS_REQUIRED_SQL = REQUIRED_SQL;
export const DRAFTS_REQUIRED_ENV = [...REQUIRED_ENV];
