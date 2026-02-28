import {
  createDraftInTable,
  readDraftFromTable,
} from "@/lib/supabase/drafts";

export async function internalContentDraft(request: {
  method: "GET" | "POST";
  id?: string;
  body?: { title?: string; body?: string };
}) {
  if (request.method === "POST") {
    const created = await createDraftInTable(request.body ?? {});

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

  if (!request.id) {
    return {
      ok: false,
      error: "Missing draft id",
    };
  }

  const found = await readDraftFromTable(request.id);

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
