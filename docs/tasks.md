# Task Tracker

## task-00014 — SEC — Merge-flow smoke retry

- Status: Done
- Previous status: In Progress
- Branch: `chore/sec/task-00014-merge-smoke-retry`
- Scope completed:
  - Updated `docs/tasks.md` status for task-00014 from In Progress to Done
  - Added merge-flow smoke retry note to `docs/SECURITY_BASELINE.md` under "Merge Smoke Retry Notes"

## task-00013 — UI — Merge-flow smoke retry

- Status: Done
- Previous status: In Progress
- Branch: `chore/ui/task-00013-merge-smoke-retry`
- Scope completed:
  - Updated task tracker state for merge-flow smoke retry completion
  - Added merge smoke retry notes to `docs/UI_FOUNDATIONS.md`

## task-00007 — UI — Login screen + redirect UX baseline (M1 Block C)

- Status: Done
- Previous status: In Progress
- Branch: `feat/ui/task-00007-login-redirect-baseline`
- Scope completed:
  - Added minimal login UI shell in `src/ui/login.tsx` with email, password, and Sign In button
  - Kept sign-in behavior as UI placeholder only (no backend/auth SDK integration)
  - Added post-login `next` redirect handling contract with safe-relative-path check and `/app` fallback
  - Updated `docs/UI_FOUNDATIONS.md` with login UX baseline notes

## task-00008 — DEV — Internal compliance-check stub endpoint (M1 Block C)

- Status: Done
- Previous status: In Progress
- Branch: `feat/dev/task-00008-internal-compliance-stub`
- Scope completed:
  - Added internal compliance check endpoint scaffold in `src/api/internal/compliance/check.ts`
  - Added request shape for content-based compliance input
  - Returns placeholder normalized findings array shape with `severity`, `issue`, `details`, `suggestion`, and `location`
  - Updated API boundary documentation for internal compliance endpoint intent

## task-00006 — SEC — Supabase auth baseline flow (M1 Block C)

- Status: Done
- Previous status: In Progress
- Branch: `feat/sec/task-00006-supabase-auth-baseline`
- Scope completed:
  - Added auth flow contract documentation in `docs/AUTH_FLOW.md`
  - Documented `/login` expectation, `/app/*` protection behavior, and `next` redirect contract
  - Verified middleware contract alignment with implemented placeholder check: `request.cookies.get('session')?.value`
  - Updated `docs/SECURITY_BASELINE.md` with an "Auth Baseline (MVP)" section

## task-00004 — UI — Save Draft wiring to internal endpoint (M1 Block B)

- Status: Done
- Previous status: In Progress
- Branch: `feat/ui/task-00004-save-draft-wireup`
- Scope completed:
  - Wired Save Draft button in `src/ui/editor-shell.tsx` to `POST /api/internal/content/draft`
  - Added basic save UI states: saving, success message, and error message
  - Added save-flow behavior notes to `docs/UI_FOUNDATIONS.md`

## task-00005 — SEC — Middleware reintroduce + auth guard implementation note (M1 Block B)

- Status: Done
- Previous status: In Progress
- Branch: `chore/sec/task-00005-middleware-guard`
- Scope completed:
  - Reintroduced root `middleware.ts` auth guard skeleton for `/app/*`
  - Added unauthenticated redirect from `/app/*` to `/login` (placeholder cookie/session check)
  - Updated `docs/SECURITY_BASELINE.md` to match implemented middleware behavior
  - Re-verified `.env.example` and `.gitignore` environment hygiene compliance

## task-00003 — DEV — Internal generation endpoint scaffold (M1 Block B)

- Status: Done
- Previous status: In Progress
- Branch: `feat/dev/task-00003-internal-generate-stub`
- Scope completed:
  - Added internal generation endpoint scaffold in `src/api/internal/content/generate.ts`
  - Accepts `prompt` + `contentType` request inputs
  - Uses provider abstraction hook/stub shape with Codex-preferred provider selection and fallback-capable structure
  - Returns placeholder generated draft payload structure only (no real provider/API key wiring)
  - Added internal generate endpoint intent note to `docs/API_BOUNDARY.md`

## task-00001 — UI — Editor draft flow shell (M1 Block A)

- Status: Done
- Previous status: In Progress
- Branch: `feat/ui/task-00001-editor-draft-flow`
- Scope completed:
  - Added editor draft flow shell UI elements in `src/ui/editor-shell.tsx`
  - Kept content type options unchanged (4)
  - Added UI-only Save Draft handler placeholder
  - Added draft flow behavior notes to `docs/UI_FOUNDATIONS.md`

## task-00000 — DEV — Supabase wiring + internal draft endpoint (M1 Block A)

- Status: Done
- Previous status: In Progress
- Branch: `feat/dev/task-00000-supabase-wireup`
- Scope completed:
  - Added minimal Supabase server scaffold in `src/lib/supabase/server.ts`
  - Added internal draft endpoint scaffold in `src/api/internal/content/draft.ts` (in-memory create/read)
  - Added API boundary note for internal draft endpoint in `docs/API_BOUNDARY.md`
