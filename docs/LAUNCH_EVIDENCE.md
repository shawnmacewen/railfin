# Launch Readiness Evidence

Last updated (UTC): 2026-02-28 23:58
Prepared by: DEV (task-00081)
Branch: `feat/dev/task-00081-prod-draft-persistence-verify`

## Evidence Checklist (current status)

### 1) Deployed commit on Vercel

- Status: **PENDING** (not blocked)
- Current local candidate commit: `b7b9097`
- Verified/Not Verified: **Not Verified**
- Required proof source:
  - Vercel Production deployment details page showing:
    - deployment URL
    - git commit SHA
    - deploy timestamp
  - Acceptable evidence artifact: screenshot or copied deployment metadata in release notes.

### 2) Env vars present in runtime

- Status: **PENDING** (not blocked)
- Verified/Not Verified: **Not Verified**
- Expected runtime env vars (from current API/runtime contract):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AI_PROVIDER` (optional selector; defaults to `codex`)
- Required proof source:
  - Vercel Project → Environment Variables panel (Production scope), or
  - runtime startup/log evidence from production showing resolved/masked env presence.

### 3) Drafts create/read runtime verification

- Status: **PENDING** (not blocked)
- Verified/Not Verified: **Not Verified**
- Verification target:
  - `POST /api/internal/content/draft` create succeeds (`ok: true`)
  - `GET /api/internal/content/draft?id=<id>` read succeeds (`ok: true`)
  - backed by Supabase `public.drafts` table in production runtime
- Required proof source:
  - Production smoke test output (curl/Postman/test harness) with request/response captures, and
  - Supabase table row evidence for created draft id.

**Operator verification runbook (production proof capture):**

1. Capture deployment anchor first:
   - production URL
   - deployed git SHA
   - timestamp (UTC)
2. Create draft:
   - `curl -sS -X POST "$APP_URL/api/internal/content/draft" -H 'content-type: application/json' -d '{"title":"prod-smoke","body":"task-00081 proof"}'`
   - Save full JSON response and extract `data.id`.
3. Read draft back by id:
   - `curl -sS "$APP_URL/api/internal/content/draft?id=$DRAFT_ID"`
   - Save full JSON response.
4. Confirm Supabase table evidence:
   - Query/filter `public.drafts` by the same `$DRAFT_ID` in Supabase SQL editor/table UI.
   - Capture screenshot (id/title/body/created_at visible).

**Evidence package must include:**

- Deployed URL + SHA + UTC timestamp in one note/screenshot.
- POST response (`ok: true`, `data.id` present).
- GET response (`ok: true`, same `data.id`).
- Supabase `public.drafts` row proof for same id.

### 4) AI provider primary/fallback runtime check

- Status: **PENDING** (not blocked)
- Verified/Not Verified: **Not Verified**
- Verification target:
  - Primary provider path executes (`codex` by default or configured `AI_PROVIDER`)
  - Fallback path executes when primary fails/timeouts (`chatgpt-api`)
  - Endpoint remains contract-stable (`ok: true`, normalized findings)
- Required proof source:
  - Production/staging runtime logs showing provider selection and fallback event, and/or
  - Controlled failure test report demonstrating fallback behavior with captured responses.

---

## Tiny Operator Checklist (Rolly)

Fill these values to complete launch evidence quickly:

- [ ] Vercel deploy URL: `____________________`
- [ ] Deployed commit SHA: `____________________`
- [ ] Deploy timestamp (UTC): `____________________`
- [ ] Env vars confirmed present (Y/N): `____`
- [ ] Draft create/read smoke result: `PASS / FAIL`
- [ ] AI primary path result: `PASS / FAIL`
- [ ] AI fallback path result: `PASS / FAIL`
- [ ] Links to proof artifacts (logs/screenshots):
  - `____________________`
  - `____________________`

## Completion Rule

When all four checklist items are set to **Verified**, this document can be marked `Launch Evidence: COMPLETE`.
Until then, pending evidence is tracked as **PENDING** (informational, not blocked by this doc task).
