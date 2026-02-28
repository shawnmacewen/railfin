# Launch Readiness Evidence

Last updated (UTC): 2026-02-28 17:42
Prepared by: DEV (task-00060)
Branch: `chore/dev/task-00060-launch-evidence-capture`

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
