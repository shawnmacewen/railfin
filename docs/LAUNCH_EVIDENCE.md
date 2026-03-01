# Launch Readiness Evidence

Last updated (UTC): 2026-03-01 00:50
Prepared by: SEC (task-00083)
Branch: `chore/sec/task-00083-launch-evidence-closeout`

## Evidence Ledger (deterministic source for GO/NO-GO)

### 1) Deployed commit on Vercel

- Critical: **YES**
- Verified: **YES (partial chain verified to current main target)**
- Tonight verified evidence:
  - Production deploy commit progression captured in Vercel deploy history up to current main target.
  - Current main progression reference used for closeout: `5a90d76 -> 2b8d77b -> 73f38d9 -> 2e0edf6 -> 6e4fe3a -> 25487d6`.
- Evidence artifact expectation:
  - Vercel Production deployment details screenshot/export including deploy URL + deployed SHA + UTC timestamp.

### 2) Env vars present in runtime

- Critical: **YES**
- Verified: **NO (still open)**
- Required runtime vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - AI provider key path (`CODEX_API_KEY` and/or fallback path `OPENAI_API_KEY`/`CHATGPT_API_KEY`)
- Operator proof steps:
  1. Open Vercel Project → Settings → Environment Variables (Production).
  2. Capture screenshot showing var names present (values masked is fine).
  3. Add UTC timestamp and environment scope in evidence note.

### 3) Draft runtime verification (create/read against production)

- Critical: **YES**
- Verified: **PARTIAL (write verified, read still open)**
- Tonight verified production write evidence:
  - `POST /api/internal/content/draft` returned `200` with `ok: true`.
  - Supabase `public.drafts` row exists for created draft id (DB evidence captured).
- Known constraint encountered:
  - Unauthenticated direct `curl` to Vercel protected production produced `401` until authenticated/browser-session context was used.

#### Remaining open item: draft read proof (required)

1. Reuse authenticated context (browser devtools/cookie-authenticated client or authorized API tool).
2. Read by id:
   - `GET /api/internal/content/draft?id=<created-id>`
3. Capture response proving:
   - `200`
   - `ok: true`
   - returned `data.id` matches created id.
4. Capture matching `public.drafts` row (id/title/body/created_at visible).

### 4) AI provider primary/fallback runtime proof

- Critical: **YES**
- Verified: **NO (open)**

#### Required primary-path proof

1. Run compliance check in production under normal provider conditions.
2. Capture logs/response showing configured primary provider executed.
3. Record endpoint response contract (`ok: true`, normalized findings shape).

#### Required fallback-path proof

1. Trigger controlled primary failure (timeout/invalid primary key or deliberate provider disable in non-destructive test window).
2. Re-run compliance check and capture logs showing fallback provider path executed.
3. Capture final response and ensure contract stability (`ok: true`, normalized findings).
4. Record incident owner acknowledgment for degraded-mode handling.

---

## Constraints & Notes

- Vercel project protection can return `401` for unauthenticated direct `curl`; evidence collection must use authenticated context.
- Deterministic launch policy remains unchanged: all critical items must be `Verified: YES` for GO.

## Completion Rule

- `Launch Evidence: COMPLETE` only when all four critical sections are fully `Verified: YES` with linked artifacts.
- Current status: **INCOMPLETE (open: env runtime proof, draft read proof, AI primary/fallback runtime proof).**
