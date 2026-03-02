import { createHash } from "crypto";

type UndoRecord = {
  undoToken: string;
  previousContent: string;
  createdAt: number;
};

const undoStore = new Map<string, UndoRecord>();
const UNDO_TTL_MS = 15 * 60 * 1000;

function sessionScopeKey(cookiePairs: Array<{ name: string; value: string }>): string {
  const raw = cookiePairs.map((item) => `${item.name}=${item.value}`).sort().join(";");
  return createHash("sha256").update(raw || "anonymous", "utf8").digest("hex").slice(0, 24);
}

export function putUndoRecordForSession(
  cookiePairs: Array<{ name: string; value: string }>,
  record: { undoToken: string; previousContent: string },
): void {
  const key = sessionScopeKey(cookiePairs);
  undoStore.set(key, {
    ...record,
    createdAt: Date.now(),
  });
}

export function consumeUndoRecordForSession(
  cookiePairs: Array<{ name: string; value: string }>,
  undoToken: string,
): { previousContent: string } | null {
  const key = sessionScopeKey(cookiePairs);
  const record = undoStore.get(key);

  if (!record || record.undoToken !== undoToken) {
    return null;
  }

  if (Date.now() - record.createdAt > UNDO_TTL_MS) {
    undoStore.delete(key);
    return null;
  }

  undoStore.delete(key);
  return { previousContent: record.previousContent };
}
