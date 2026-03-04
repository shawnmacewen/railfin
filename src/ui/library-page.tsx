"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "./primitives";

type Draft = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type LibraryResponse = {
  ok: boolean;
  data?: {
    items: Draft[];
    total: number;
    limit: number;
    offset: number;
    q: string;
  };
  error?: string;
};

type LoadState = "loading" | "ready" | "empty" | "error";

function formatCreatedAt(value: string) {
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return "Created: Unknown date";
  }

  return `Created: ${asDate.toLocaleString()}`;
}

function excerpt(text: string) {
  const plain = text
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\/(p|div|h1|h2|h3|li|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const compact = plain.replace(/\s+/g, " ").trim();
  return compact.length > 220 ? `${compact.slice(0, 220)}…` : compact;
}

export function LibraryPageContent() {
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDrafts() {
      setState("loading");
      setError(null);

      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }

      const endpoint = params.toString()
        ? `/api/internal/content/list?${params.toString()}`
        : "/api/internal/content/list";

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => ({}))) as LibraryResponse;

        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error || "Unable to load drafts.");
        }

        setDrafts(payload.data.items);
        setState(payload.data.items.length > 0 ? "ready" : "empty");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setDrafts([]);
        setState("error");
        setError(err instanceof Error ? err.message : "Unable to load drafts.");
      }
    }

    void loadDrafts();

    return () => controller.abort();
  }, [query]);

  const heading = useMemo(() => {
    if (!query.trim()) {
      return "Latest drafts";
    }

    return `Results for “${query.trim()}”`;
  }, [query]);

  return (
    <Card>
      <div className="rf-library-header">
        <h2 className="rf-sr-only">Library</h2>
        <p className="rf-library-subtitle rf-library-subtitle-standalone">Search and browse saved drafts.</p>
      </div>

      <label htmlFor="library-search">Search drafts</label>
      <input
        id="library-search"
        name="library-search"
        type="search"
        placeholder="Search title or content"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <h3 className="rf-library-section-title">{heading}</h3>

      {state === "loading" ? <p role="status">Loading drafts…</p> : null}

      {state === "error" ? <p role="alert">{error ?? "Unable to load drafts."}</p> : null}

      {state === "empty" ? (
        <p role="status">
          {query.trim()
            ? "No drafts matched your search."
            : "No drafts yet. Save a draft from Create to populate the library."}
        </p>
      ) : null}

      {state === "ready" ? (
        <ul className="rf-library-list">
          {drafts.map((draft) => (
            <li key={draft.id} className="rf-library-item">
              <h4>{draft.title || "Untitled Draft"}</h4>
              <p className="rf-library-meta">{formatCreatedAt(draft.createdAt)}</p>
              <p className="rf-library-description-label">Description</p>
              <p className="rf-library-description-preview">{excerpt(draft.body) || "(No body content)"}</p>
              <Link className="rf-library-open-link" href={`/app/create?draftId=${encodeURIComponent(draft.id)}`}>
                Open in Create
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
