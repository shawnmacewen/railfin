# Tasks

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
