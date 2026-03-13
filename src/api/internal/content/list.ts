import { listDraftsFromTable } from "../../../lib/supabase/drafts";
import type { DataScope } from "../../../lib/supabase/scope";

export async function internalContentList(request: {
  q?: string;
  limit?: number;
  offset?: number;
  scope: DataScope;
}) {
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
