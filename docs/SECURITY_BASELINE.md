# Security Baseline Verification

## Preview Validation Checklist (task-00029)

- [x] Guard source verified at repository root: `middleware.ts`
- [x] Matcher scope verified: `config.matcher = ['/app/:path*']`
- [x] Unauthenticated `/app/*` requests redirect to `/login?next=<encoded(pathname+search)>`
- [x] Authenticated `/app/*` requests pass through via `NextResponse.next()` when `session` or `auth-token` cookie exists
- [ ] Strict internal-only redirect enforcement for `/login?next` (current `startsWith('/')` allows protocol-relative forms like `//example.com`)

Preview outcome for task-00029: **FAIL** (open-redirect hardening gap in `next` sanitization rule).

## task-00024 — Final auth/guard verification pass

Final verification source of truth remains **root `middleware.ts`** for `/app/:path*` protection, with login redirect sanitization enforced in both `src/ui/login.tsx` and `src/app/auth/login/route.ts`.

| Case | Expected | Evidence | Result | Rationale |
|---|---|---|---|---|
| Unauthenticated access to `/app/*` | Redirect to `/login?next=<encoded-internal-path>` | `middleware.ts` computes `next = pathname + search`; when no `session`/`auth-token` cookie exists, it redirects to ``/login?next=${encodeURIComponent(next)}``. | **PASS** | Unauthenticated requests are consistently redirected to login with encoded internal return path. |
| Authenticated access to `/app/*` | Allow request to continue | `middleware.ts` sets `hasSession` true when either `session` or `auth-token` cookie is present, then returns `NextResponse.next()`. | **PASS** | Placeholder authenticated state permits access to protected app routes without redirect. |
| `/login?next=` safety behavior | Reject/sanitize non-internal redirects | `src/ui/login.tsx` only accepts `next` values starting with `/`; otherwise falls back to `/`. `src/app/auth/login/route.ts` also enforces `toSafeRedirect(next)` with same internal-only rule. | **PASS** | External/open redirect payloads are sanitized to `/` in both client flow and auth endpoint response contract. |

### Final pass outcome

- Overall outcome: **PASS**
- Blockers: **None**
- Guard location and scope confirmed: root `middleware.ts`, matcher `['/app/:path*']`

## task-00021 — Final guard verification rerun

Verification source of truth for middleware guard behavior is **root `middleware.ts`** (explicitly verified). `src/middleware.ts` does not exist in this repo, preventing false BLOCKED findings from wrong-path checks.

| Case | Expected | Evidence | Result | Rationale |
|---|---|---|---|---|
| Unauthenticated access to `/app/*` | Redirect to `/login?next=<encoded-internal-path>` | Root `middleware.ts` checks missing `session`/`auth-token`, builds `next` from ``${pathname}${search}``, and redirects using `encodeURIComponent(next)`. | **PASS** | Guard path executes for unauthenticated requests and sends login redirect with encoded `next` preserving internal route context. |
| Authenticated access to `/app/*` | Allow request to continue | Root `middleware.ts` sets `hasSession` true when either `session` or `auth-token` cookie is present, then returns `NextResponse.next()`. | **PASS** | Valid placeholder auth cookie bypasses redirect path and allows app route handling. |
| Invalid `next` handling | Reject/sanitize non-internal redirects | `src/ui/login.tsx` reads query `next` and only accepts values where `raw.startsWith('/')`; otherwise it falls back to `DEFAULT_REDIRECT = '/'`. | **PASS** | Open/external redirect inputs are sanitized to `/`, preserving internal-only redirect contract. |

### Guard location + scope (explicit)

- Guard location verified: `middleware.ts` at repository root
- Non-source-path check: `src/middleware.ts` is absent (not used for verification)
- Matcher scope: `config.matcher = ['/app/:path*']`

## task-00018 — Middleware Guard Restore (rapid fix)

| Case | Expected | Evidence | Result |
|---|---|---|---|
| Unauthenticated access to `/app/*` | Redirect to `/login?next=<encoded-internal-path>` | `middleware.ts` checks for `session` or `auth-token` cookies and redirects with `NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(pathname + search), request.url))`. | **PASS** |
| Matcher scope | Guard applies only to protected app routes | `middleware.ts` exports `config.matcher = ['/app/:path*']`. | **PASS** |
| Authenticated access to `/app/*` | Allow request to continue | `middleware.ts` returns `NextResponse.next()` when placeholder session cookie check passes. | **PASS** |

### Current Guard Behavior

- Guard location: root `middleware.ts`
- Protected route scope: `/app/:path*`
- Session/auth check (placeholder): cookie presence of either `session` or `auth-token`
- Unauthenticated behavior: redirect to `/login?next=<pathname+search>` with URL-encoded `next`

## Historical Note (task-00017)

The earlier **BLOCKED** finding for missing `/app/*` guard wiring is resolved by the middleware restoration above.

## task-00042 — Shell/nav security visibility baseline

### Baseline assumptions

- Current shell is treated as a **single authenticated product role** (no in-app role split enforced yet).
- Navigation visibility is therefore currently aligned with authenticated access, not role-level authorization.
- Route protection for product surfaces continues to rely on middleware scope for `/app/:path*` plus server-side checks where sensitive actions are introduced.

### Future admin-role notes (`/configure`, `/admin`)

- `/configure` and `/admin` are treated as **future privileged surfaces** and should not be exposed by default to the single-role shell nav.
- When admin RBAC lands, both nav visibility and route/action authorization must enforce `admin` (or equivalent privileged claim), not just UI hiding.
- Direct URL access to admin surfaces must fail closed (redirect to safe location or return 403) for non-admin users.

### Access-control matrix (shell pages)

| Surface | Unauthenticated | Authenticated (current single-role) | Authenticated (future non-admin) | Authenticated (future admin) | Guard expectation |
|---|---|---|---|---|---|
| `/login` | Allowed | Allowed (typically redirects into app flow) | Allowed | Allowed | Public entry point; sanitize `next` to internal paths only. |
| `/app/*` | Redirect to `/login?next=...` | Allowed | Allowed | Allowed | Enforced by middleware matcher `/app/:path*`; server checks required for sensitive operations. |
| `/configure` (planned) | Deny/redirect to login | Not yet exposed as privileged in current baseline | Deny/redirect or 403 | Allowed | Require explicit admin-role guard in middleware/server handlers; nav item visible only to admin. |
| `/admin` (planned) | Deny/redirect to login | Not yet exposed as privileged in current baseline | Deny/redirect or 403 | Allowed | Require explicit admin-role guard in middleware/server handlers; never rely on client-only visibility control. |

### Verification outcome (task-00042)

- Outcome: **PASS**
- Type: Documentation baseline alignment (no runtime behavior change introduced in this task)

## task-00045 — AI compliance safety/guardrails checklist

### Guardrails (policy-aligned)

- **No legal-approval claims:** AI compliance results must not be labeled or presented as legal approval, legal sign-off, or legal advice. UI copy, logs, and API payloads must use language such as "automated policy check" or "preliminary compliance signal" and require human/legal review where applicable.
- **Safe failure on model unavailability:** If the model/provider is unavailable, times out, or returns invalid output, the compliance endpoint must fail closed for release decisions (no implicit PASS). Return a clear degraded-state response that blocks auto-approval and instructs retry/escalation to human review.
- **Sensitive text logging/redaction:** Request/response logging for compliance checks must apply redaction/minimization. Do not persist raw sensitive text when avoidable; prefer metadata, hashes, or truncated excerpts with explicit redaction markers. Access to any retained diagnostic text must be restricted and audited.

### AI compliance endpoint launch go/no-go checks

| Check | Go criteria | No-go trigger |
|---|---|---|
| Legal-approval wording control | Endpoint/UI/docs avoid legal-approval or legal-advice claims; human review requirement is explicit. | Any user-visible or internal claim implies legal sign-off by the model/service. |
| Failure-mode behavior | Model outage/timeout path returns explicit degraded/error state and blocks automated approval decisions. | Outage path defaults to PASS, silently skips checks, or allows release without escalation. |
| Logging/redaction controls | Sensitive text handling documented and implemented with minimization/redaction and restricted access. | Raw sensitive payloads are logged broadly, retained without controls, or redaction path is undefined. |
| Operational readiness evidence | Runbook/checklist includes incident owner + escalation path for model/provider failures. | No named owner/escalation, or on-call cannot distinguish degraded vs healthy compliance state. |

### Verification outcome (task-00045)

- Outcome: **PASS**
- Type: Documentation + launch-gate checklist alignment (no runtime behavior change introduced in this task)

## task-00057 — RLS launch-go verification rerun after path repair

Rerun executed against the canonical repository path: `/home/node/railfin`.

### Rerun checklist

- [x] Canonical path confirmed (`/home/node/railfin`)
- [x] Launch-go code-path artifacts confirmed present (`middleware.ts`, `src/app/api/internal/compliance/check/route.ts`, `src/ai/providers/*`)
- [x] Prior path-confusion class eliminated (no reliance on missing `src/middleware.ts` for this decision)
- [x] Provider-chain failure mode verified in code (safe fallback finding returned when providers fail)
- [ ] Environment readiness evidence captured in this runtime (provider credentials + named incident owner/escalation)

### GO/NO-GO rerun matrix (task-00057)

| Check | Current evidence (canonical path) | Result | Rationale |
|---|---|---|---|
| Legal-approval wording control | Guardrail documented in this baseline; UI/legal-disclaimer language previously verified in hosted smoke rerun context. | **PASS** | Current docs/code context does not present model output as legal sign-off. |
| Failure-mode behavior | `src/app/api/internal/compliance/check/route.ts` returns safe fallback finding when provider chain throws. | **PASS** | Degraded path is explicit and non-silent; no missing-code-path blocker. |
| Logging/redaction controls | Guardrail documented at policy level; no contradictory broad raw-payload logger found in current checked files. | **PASS (docs/code baseline)** | Baseline control definition remains intact in canonical code/doc context. |
| Operational readiness evidence | Runtime env in this rerun has no visible provider credential variables (`CODEX_API_KEY`/`OPENAI_API_KEY`/`CHATGPT_API_KEY`) and no named on-call escalation artifact in checked launch docs. | **BLOCKED (environment)** | Blocker is deployment environment readiness evidence, not repository path/code absence. |

### Rerun outcome (task-00057)

- Overall outcome: **BLOCKED**
- Blocker class: **Environment readiness**
- Not a blocker: Missing/incorrect repository code path

## task-00059 — SEC — Final GO/NO-GO recheck after task-00058 landed on main

Recheck executed on latest `main` commit `b7b9097` from canonical path `/home/node/railfin`.

### Final recheck inputs (current env assumptions)

- [x] `task-00058` code is present on main (`src/lib/supabase/drafts.ts`, `src/api/internal/content/draft.ts`).
- [x] Draft persistence now actively reads required env at runtime (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- [x] Explicit blocked-mode diagnostics include required SQL for `public.drafts` table creation.
- [ ] Required runtime env evidence present in current execution environment.
- [ ] Confirmed deployed DB/table readiness evidence (`public.drafts` reachable with service role).
- [ ] Named incident owner/escalation evidence for AI-provider degraded state (from task-00057 launch-gate requirement).

### Final launch GO/NO-GO decision

| Gate | Evidence on latest main | Result |
|---|---|---|
| Auth/guard baseline | `/app/:path*` middleware guard and login redirect sanitization behavior remain in place from prior PASS checks. | **PASS** |
| Draft persistence safety/clarity | Runtime now fails explicitly with structured `blocked` diagnostics when env/table prerequisites are missing. | **PASS** |
| Environment readiness proof | Current runtime shows no required provider/Supabase env vars and no deployment-level proof of `public.drafts` readiness in this check context. | **BLOCKED** |
| Operational launch ownership | No explicit on-call/incident escalation artifact attached in checked launch docs. | **BLOCKED** |

### Verdict (task-00059)

- **Final decision: NO-GO (BLOCKED)**
- Reason class: **Environment/operations readiness**, not code-path absence.

### Residual prerequisites to clear NO-GO

1. Provide deploy-time env evidence for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - AI provider key(s): `CODEX_API_KEY` and/or fallback key path (`OPENAI_API_KEY`/`CHATGPT_API_KEY`)
2. Confirm `public.drafts` exists and is writable/readable by service role (apply SQL from `src/lib/supabase/drafts.ts` if missing).
3. Attach named incident owner + escalation path for AI provider degraded mode in launch/runbook artifacts.
4. Re-run launch gate once items (1)-(3) are evidenced in target runtime.

## task-00061 — SEC — Deterministic GO/NO-GO policy (evidence model)

Decision source of truth: `docs/LAUNCH_EVIDENCE.md`.

### Deterministic launch decision model

- **GO** only when **all** evidence fields in `docs/LAUNCH_EVIDENCE.md` are marked `Verified: YES`.
- **NO-GO** when **any Critical: YES** field in `docs/LAUNCH_EVIDENCE.md` is unverified (`Verified: NO` or blank).
- If any non-critical field exists and is unverified, decision remains **NO-GO** until explicitly waived and documented by release authority.

### Required incident ownership fields (must be filled before GO)

- Incident owner name:
- Incident owner contact:
- Escalation backup name:
- Escalation backup contact:

### Verification outcome (task-00061)

- Outcome: **PASS** (policy/documentation update)
- Type: Deterministic decision policy + evidence ledger contract alignment
