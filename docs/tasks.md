# Tasks

## task-00000 — DEV — Supabase wiring + internal draft endpoint scaffold

- Status: **Done**
- Branch: `feat/dev/task-00000-supabase-wireup`
- Scope delivered:
  - Added initial Supabase server scaffold
  - Added internal draft endpoint scaffold
  - Added initial API boundary notes

## task-00001 — UI — Editor draft flow shell

- Status: **Done**
- Branch: `feat/ui/task-00001-editor-draft-flow`
- Scope delivered:
  - Added editor shell with content selector, prompt input, draft area, and save button placeholder
  - Updated UI foundations docs

## task-00002 — SEC — Auth baseline hardening pass

- Status: **Done**
- Branch: `chore/sec/task-00002-auth-guard-baseline`
- Scope delivered:
  - Added/updated security baseline notes and env hygiene checks
  - Established initial secret-handling checklist

## task-00003 — DEV — Internal generation endpoint scaffold

- Status: **Done**
- Branch: `feat/dev/task-00003-internal-generate-stub`
- Scope delivered:
  - Added internal content generation stub endpoint
  - Documented provider-abstraction intent (Codex-first, fallback-ready)

## task-00004 — UI — Save Draft wiring to internal endpoint

- Status: **Done**
- Branch: `feat/ui/task-00004-save-draft-wireup`
- Scope delivered:
  - Wired save draft action to internal draft endpoint
  - Added saving/success/error UI states

## task-00005 — SEC — Middleware reintroduce + auth guard notes

- Status: **Done**
- Branch: `chore/sec/task-00005-middleware-guard`
- Scope delivered:
  - Reintroduced middleware guard skeleton for `/app/*`
  - Synced security docs to implemented behavior

## task-00006 — SEC — Supabase auth baseline flow

- Status: **Done**
- Branch: `feat/sec/task-00006-supabase-auth-baseline`
- Scope delivered:
  - Added auth flow contract docs (`/login`, `/app/*`, `next` behavior)
  - Updated security baseline for auth expectations

## task-00007 — UI — Login screen + redirect UX baseline

- Status: **Done**
- Branch: `feat/ui/task-00007-login-redirect-baseline`
- Scope delivered:
  - Added baseline login screen
  - Added safe redirect handling for `next`

## task-00008 — DEV — Internal compliance-check stub endpoint

- Status: **Done**
- Branch: `feat/dev/task-00008-internal-compliance-stub`
- Scope delivered:
  - Added internal compliance check stub endpoint
  - Standardized findings output shape for UI use

## task-00009 — DEV — Merge-flow smoke test (first pass)

- Status: **Done**
- Branch: `chore/dev/task-00009-merge-smoke-doc-touch`
- Scope delivered:
  - Verified git repo state and identified initial missing `origin` blocker

## task-00010 — UI — Merge-flow smoke test (first pass)

- Status: **Done**
- Branch: `chore/ui/task-00010-merge-smoke-doc-touch`
- Scope delivered:
  - Verified merge-path prerequisites and surfaced missing remote condition

## task-00011 — SEC — Merge-flow smoke test (first pass)

- Status: **Done**
- Branch: `chore/sec/task-00011-merge-smoke-doc-touch`
- Scope delivered:
  - Verified merge-path prerequisites and surfaced missing remote condition

## task-00012 — DEV — Merge-flow smoke retry

- Status: **Done**
- Branch: `chore/dev/task-00012-merge-smoke-retry`
- Scope delivered:
  - Docs-only branch/commit/push smoke passed after remote fix

## task-00013 — UI — Merge-flow smoke retry

- Status: **Done**
- Branch: `chore/ui/task-00013-merge-smoke-retry`
- Scope delivered:
  - Docs-only branch/commit/push smoke passed after remote fix

## task-00014 — SEC — Merge-flow smoke retry

- Status: **Done**
- Branch: `chore/sec/task-00014-merge-smoke-retry`
- Scope delivered:
  - Docs-only branch/commit/push smoke passed after remote fix

## task-00015 — DEV — Supabase session helper wiring (MVP integration block)

- Status: **Done**
- Branch: `feat/dev/task-00015-supabase-session-wiring`
- Scope delivered:
  - Added minimal server-side auth/session helper in `src/lib/supabase/server.ts`
  - Added boundary usage note in `docs/API_BOUNDARY.md`
  - Confirmed protected internal endpoints can consume helper via documented usage pattern

## task-00017 — SEC — Protected route behavior verification (MVP integration block)

- Status: **Done**
- Branch: `chore/sec/task-00017-protected-route-verification`
- Scope delivered:
  - Verified login `next` propagation + sanitization behavior in `src/ui/login.tsx`
  - Added security verification matrix and findings in `docs/SECURITY_BASELINE.md`
  - Logged `/app/*` protection mismatch with exact missing locations as **BLOCKED**

## task-00019 — SEC — Verification rerun after middleware restore

- Status: **Done**
- Branch: `chore/sec/task-00019-verify-guard-matrix`
- Scope delivered:
  - Re-ran `/app/*` guard verification matrix after expected middleware restore point
  - Re-validated login invalid-`next` sanitization behavior in `src/ui/login.tsx`
  - Recorded rerun status and blocker evidence in `docs/SECURITY_BASELINE.md`

## task-00020 — UI — Login redirect contract sanity check

- Status: **Done**
- Branch: `chore/ui/task-00020-login-contract-sanity`
- Scope delivered:
  - Confirmed `src/ui/login.tsx` keeps middleware contract compatibility for `/login?next=`
  - Documented guard contract note in `docs/UI_FOUNDATIONS.md`

## task-00018 — SEC — Unblock middleware guard (rapid fix)

- Status: **Done**
- Branch: `fix/sec/task-00018-restore-middleware-guard`
- Scope delivered:
  - Restored root `middleware.ts` route guard for `/app/:path*`
  - Added unauthenticated redirect to `/login?next=<encoded-path>`
  - Implemented placeholder cookie/session gate (`session` or `auth-token` cookie)
  - Updated `docs/SECURITY_BASELINE.md` to reflect active middleware behavior

## task-00021 — SEC — Final guard verification rerun (sequential close)

- Status: **Done**
- Branch: `chore/sec/task-00021-final-guard-rerun`
- Scope delivered:
  - Re-ran final verification matrix against current repo state
  - Confirmed verification source is root `middleware.ts` (and that `src/middleware.ts` is absent)
  - Re-validated unauthenticated redirect, authenticated allow path, and invalid `next` sanitization
  - Updated `docs/SECURITY_BASELINE.md` with final PASS/BLOCKED matrix rationale

## task-00022 — DEV — Minimal /auth/login contract endpoint (MVP integration)

- Status: **Done**
- Branch: `feat/dev/task-00022-auth-login-endpoint`
- Scope delivered:
  - Added contract-first `POST /auth/login` endpoint in `src/app/auth/login/route.ts`
  - Accepts `email`, `password`, and optional `next` in JSON body
  - Returns placeholder success/error JSON shape expected by the UI
  - Defers real Supabase auth/session creation to later integration stage

## task-00023 — UI — Compliance check panel wiring (MVP integration)

- Status: **Done**
- Branch: `feat/ui/task-00023-compliance-panel-wireup`
- Scope delivered:
  - Wired `Run Compliance Check` button in `src/ui/compliance-panel.tsx` to `POST /api/internal/compliance/check`
  - Added response handling for stubbed compliance check payloads with error and loading states
  - Rendered findings list fields: `severity`, `issue`, `details`, `suggestion`, `location`
  - Kept implementation contract-first with no styling overhaul

## task-00025 — UI — Integrate compliance panel into editor flow

- Status: **Done**
- Branch: `feat/ui/task-00025-editor-compliance-integration`
- Scope delivered:
  - Added `src/ui/editor-shell.tsx` as the minimal editor flow container
  - Integrated `CompliancePanel` into `EditorShell` so findings can be run/viewed in the main editor flow
  - Added visible editor feedback states (`Saving...`, success message, validation/error message) and save button disabled states
  - Kept implementation minimal with no styling overhaul

## task-00026 — DEV — Compliance endpoint/UI contract alignment

- Status: **Done**
- Branch: `feat/dev/task-00026-compliance-contract-align`
- Scope delivered:
  - Added `POST /api/internal/compliance/check` contract endpoint in `src/app/api/internal/compliance/check/route.ts`
  - Aligned findings payload shape to UI expectations with exact fields: `severity`, `issue`, `details`, `suggestion`, `location`
  - Normalized `location` to canonical `file:line:column` string format with safe fallback (`unknown:0:0`)
  - Kept implementation stubbed with no real model call changes

## task-00029 — SEC — Preview safety check for auth/guard behavior

- Status: **Done**
- Branch: `chore/sec/task-00029-preview-guard-check`
- Scope delivered:
  - Re-validated preview guard assumptions for `/app/*` in root `middleware.ts`
  - Re-validated `/login?next` redirect sanitization assumptions in both `src/ui/login.tsx` and `src/app/auth/login/route.ts`
  - Documented preview validation checklist and outcome in `docs/SECURITY_BASELINE.md`

## task-00024 — SEC — Final auth/guard verification pass

- Status: **Done**
- Branch: `chore/sec/task-00024-auth-guard-final-pass`
- Scope delivered:
  - Executed final auth/guard verification matrix against current implementation
  - Re-validated `/app/*` middleware behavior for unauthenticated redirect and authenticated allow path
  - Re-validated `/login?next=` safety contract (client + auth endpoint)
  - Updated `docs/SECURITY_BASELINE.md` with final pass outcomes

## task-00027 — DEV — Bootstrap runnable Next.js preview shell

- Status: **Done**
- Branch: `feat/dev/task-00027-next-preview-bootstrap`
- Scope delivered:
  - Bootstrapped a minimal runnable Next.js app shell (`package.json`, Next config, TS config, root app layout)
  - Added preview routes for `/login` and `/app/editor` using existing UI components
  - Ensured existing route handlers are runnable under app-router conventions (`/auth/login`, `/api/internal/compliance/check`)
  - Added `docs/PREVIEW_RUNBOOK.md` with exact local preview run commands and expected URLs

## task-00028 — UI — Hook login/editor routes for visual walkthrough

- Status: **Done**
- Branch: `feat/ui/task-00028-preview-route-hookup`
- Scope delivered:
  - Added preview route page wiring for login and editor walkthrough screens:
    - `src/app/preview/login/page.tsx` → `LoginForm`
    - `src/app/preview/editor/page.tsx` → `EditorShell`
  - Ensured UI hook-based components render safely via App Router by marking client components (`"use client"`) in:
    - `src/ui/login.tsx`
    - `src/ui/editor-shell.tsx`
    - `src/ui/compliance-panel.tsx`
  - Verified editor preview route includes draft save controls plus compliance panel/findings area through existing `EditorShell` + `CompliancePanel` composition

## task-00032 — UI — Login/editor UX state polish (minimal production-ready)

- Status: **Done**
- Branch: `feat/ui/task-00032-login-editor-ux-polish`
- Scope delivered:
  - Polished login UX state handling in `src/ui/login.tsx` with explicit loading/success/error messaging, busy disable behavior, and inline status semantics.
  - Refined editor draft-save UX in `src/ui/editor-shell.tsx` with clearer disabled guidance, saving lock, and stronger status feedback handling.
  - Expanded compliance action feedback in `src/ui/compliance-panel.tsx` to include completion status (success/no findings) while preserving existing API contract shape.
  - Applied modern, minimal visual state styling in `src/app/globals.css` (`card`, status variants, disabled treatment) without redesigning layout structure.

## task-00040 — UI — App shell foundation (left nav + header)

- Status: **Done**
- Branch: `feat/ui/task-00040-app-shell-foundation`
- Scope delivered:
  - Added reusable app shell in `src/ui/app-shell.tsx` and mounted it in `src/app/app/layout.tsx`.
  - Added persistent left navigation items: `Create`, `Library`, `Campaigns`, `Configure`.
  - Added top header with active page title + env badge placeholder + user menu placeholder.
  - Wired editor flow under `Create` route via `src/app/app/create/page.tsx`, with redirects from `/app` and `/app/editor` to `/app/create`.
  - Added minimal UI primitives in `src/ui/primitives.tsx` (`Button`, `Card`, `Badge`, `NavItem`) and baseline shell styling in `src/app/globals.css`.

## task-00041 — DEV — Route/layout wiring for app shell pages

- Status: **Done**
- Branch: `feat/dev/task-00041-shell-route-wiring`
- Scope delivered:
  - Added `/app` shell layout wiring with shared navigation for `create`, `library`, `campaigns`, and `configure`.
  - Added scaffold pages for `/app/create`, `/app/library`, `/app/campaigns`, and `/app/configure`.
  - Moved current editor flow host to `/app/create` and kept `/app/editor` as compatibility redirect.
  - Added top-level route shortcuts (`/create`, `/library`, `/campaigns`, `/configure`) that redirect into guarded `/app/*` routes.
  - Kept `/app/*` middleware guard compatibility unchanged.

## task-00042 — SEC — Shell/nav security visibility baseline

- Status: **Done**
- Branch: `chore/sec/task-00042-shell-security-baseline`
- Scope delivered:
  - Updated shell/navigation security visibility baseline documentation.
  - Recorded current single-role assumption for shell nav/page visibility.
  - Added future role-split notes for admin-only surfaces (`/configure`, `/admin`).
  - Documented guard expectations for `/app/*` pages and added concise access-control matrix for shell pages.

## task-00043 — DEV — AI compliance engine integration (Codex-first, fallback-ready)

- Status: **Done**
- Branch: `feat/dev/task-00043-ai-compliance-engine`
- Scope delivered:
  - Replaced placeholder-only compliance response path with AI-provider-backed compliance generation in `POST /api/internal/compliance/check`.
  - Implemented Codex-first provider execution with ChatGPT API fallback capability via existing provider abstraction.
  - Preserved UI findings contract (`severity`, `issue`, `details`, `suggestion`, `location`) with normalization safeguards.
  - Added safe fallback output when providers fail or time out to keep endpoint behavior backward compatible.
  - Updated API boundary docs with provider contract and fallback behavior notes.

## task-00046 — UI — Railfin v1 branding asset + top-left logo + favicon

- Status: **Done**
- Branch: `feat/ui/task-00046-logo-favicon-shell-branding`
- Scope delivered:
  - Added Railfin v1 branding asset to `public/brand/railfin-v1.png`.
  - Added app icon file at `src/app/icon.png` (Next app-router icon convention).
  - Updated shell branding in `src/ui/app-shell.tsx` to render the Railfin logo in the top-left nav area.
  - Updated shell styling in `src/app/globals.css` for a clean minimal logo + wordmark treatment.
  - Added branding note to `docs/UI_FOUNDATIONS.md`.

## task-00047 — DEV — Set default app route to Create dashboard

- Status: **Done**
- Branch: `feat/dev/task-00047-default-route-to-create`
- Scope delivered:
  - Updated root route `/` to redirect to `/app/create`.
  - Confirmed `/app` continues to redirect to `/app/create`.
  - Preserved existing middleware/auth behavior for `/app/*` routes.
  - Updated preview runbook to reflect default landing and redirect behavior.

## task-00055 — DEV — Re-run Supabase/Vercel env runtime verification after path repair

- Status: **Done**
- Branch: `fix/dev/task-00055-rerun-supabase-runtime-verify`
- Scope delivered:
  - Re-ran repository/runtime verification from canonical path (`/home/node/railfin`) and confirmed app build path is healthy after repair.
  - Re-checked Supabase env presence handling: no runtime `SUPABASE_*` env consumption is currently wired in server auth/content paths.
  - Re-checked draft persistence path: current internal draft path is in-memory `Map`-backed (`draftStore`), not table-backed persistence.
  - Confirmed expected `env + table` state is still unmet; blocked-mode rationale remains valid for Supabase-runtime verification stage.

## task-00058 — DEV — Unblock Supabase runtime wiring + table-backed drafts

- Status: **Done**
- Branch: `fix/dev/task-00058-unblock-supabase-runtime`
- Scope delivered:
  - Replaced in-memory draft storage in `src/api/internal/content/draft.ts` with Supabase table-backed create/read operations.
  - Added runtime Supabase wiring in `src/lib/supabase/drafts.ts` that actively reads `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
  - Added explicit BLOCKED output with exact env names + required SQL when runtime env/table access is unavailable.
  - Preserved API contract shape for UI (`ok`, `data`, `error`) while adding `blocked` metadata only for blocked-mode diagnostics.
  - Updated `docs/API_BOUNDARY.md` to reflect final table-backed draft persistence status.
