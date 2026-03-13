import {
  createDraftInTable,
  listDraftsFromTable,
  readDraftFromTable,
} from "../../../lib/supabase/drafts";
import type { DataScope } from "../../../lib/supabase/scope";

export async function internalContentDraft(request: {
  method: "GET" | "POST";
  id?: string;
  q?: string;
  limit?: number;
  offset?: number;
  body?: { title?: string; body?: string };
  scope: DataScope;
}) {
  if (request.method === "POST") {
    const created = await createDraftInTable({ ...(request.body ?? {}), scope: request.scope });

    if (!created.ok) {
      return {
        ok: false,
        error: created.blocked.error,
        blocked: created.blocked,
      };
    }

    return {
      ok: true,
      data: created.draft,
    };
  }

  if (request.id) {
    const found = await readDraftFromTable(request.id, request.scope);

    if (!found.ok) {
      return {
        ok: false,
        error: found.blocked.error,
        blocked: found.blocked,
      };
    }

    if (!found.draft) {
      return {
        ok: false,
        error: "Draft not found",
      };
    }

    return {
      ok: true,
      data: found.draft,
    };
  }

  const listed = await listDraftsFromTable(
    {
      q: request.q,
      limit: request.limit,
      offset: request.offset,
    },
    request.scope,
  );

  if (!listed.ok) {
    return {
      ok: false,
      error: listed.blocked.error,
      blocked: listed.blocked,
    };
  }

  return {
    ok: true,
    data: listed.result,
  };
}
