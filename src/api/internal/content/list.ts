import { listDraftsFromTable } from "../../../lib/supabase/drafts";

export async function internalContentList(request: {
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const listed = await listDraftsFromTable({
    q: request.q,
    limit: request.limit,
    offset: request.offset,
  });

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
