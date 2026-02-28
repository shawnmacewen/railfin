type Draft = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const draftStore = new Map<string, Draft>();

function makeDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDraft(input: { title?: string; body?: string }): Draft {
  const draft: Draft = {
    id: makeDraftId(),
    title: input.title ?? "Untitled Draft",
    body: input.body ?? "",
    createdAt: new Date().toISOString(),
  };

  draftStore.set(draft.id, draft);
  return draft;
}

export function readDraft(id: string): Draft | null {
  return draftStore.get(id) ?? null;
}

export function internalContentDraft(request: {
  method: "GET" | "POST";
  id?: string;
  body?: { title?: string; body?: string };
}) {
  if (request.method === "POST") {
    const draft = createDraft(request.body ?? {});
    return {
      ok: true,
      data: draft,
    };
  }

  if (!request.id) {
    return {
      ok: false,
      error: "Missing draft id",
    };
  }

  const draft = readDraft(request.id);
  if (!draft) {
    return {
      ok: false,
      error: "Draft not found",
    };
  }

  return {
    ok: true,
    data: draft,
  };
}
