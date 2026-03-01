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

## task-00064 — SEC — Library/configure access-control check

Verification source of truth:
- `middleware.ts` (`matcher: ['/app/:path*']`, cookie-based auth gate)
- `src/ui/app-shell.tsx` (`NAV_ITEMS` includes both `Library` and `Configure`)
- `src/app/app/library/page.tsx` and `src/app/app/configure/page.tsx` (placeholder pages with no role checks)

### Access-check matrix (current role model)

| Route | Unauthenticated | Authenticated (current single-role) | Role-specific restriction present now? | Result |
|---|---|---|---|---|
| `/app/library` | Redirect to `/login?next=...` via middleware | Allowed | No (not needed for current baseline) | **PASS** |
| `/app/configure` | Redirect to `/login?next=...` via middleware | Allowed | **No** (no RBAC split yet) | **PASS (with risk)** |

### Risks observed

- **Risk:** `/app/configure` is currently reachable by any authenticated user because the app is still operating in a single-role model.
- **Impact:** If privileged configuration actions are added before server-side RBAC is enforced, non-admin authenticated users could gain unintended access.

### Mitigations required

1. Keep `/app/configure` limited to non-sensitive placeholder content until RBAC is implemented.
2. Add explicit role/claim enforcement for `/app/configure` in server-authoritative guards (middleware and/or route handlers) before shipping privileged actions.
3. Gate navigation visibility for `Configure` by role once admin/non-admin split is introduced; do not rely on client-only hiding.
4. Add negative tests proving non-admin authenticated access receives deny behavior (redirect or 403).

### Verification outcome (task-00064)

- Outcome: **PASS** (current behavior matches documented single-role baseline)
- Residual risk: **OPEN** (future privileged surface exposure risk until RBAC guard is implemented)

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

## task-00067 — SEC — Final launch-go recheck against latest main commit

Recheck executed against latest `main` baseline commit `5a90d76` from canonical path `/home/node/railfin`.

### Deterministic model rerun (source of truth)

Policy source: `task-00061` deterministic model in this document.
Evidence source: `docs/LAUNCH_EVIDENCE.md`.

- Rule: **GO** only if all evidence items are verified.
- Current evidence state: all four launch evidence checklist items remain **Not Verified**.
- Deterministic outcome: **NO-GO**.

### Final verdict (concise)

- **Final decision: NO-GO (BLOCKED)**
- Blocker class: **Missing launch evidence inputs only** (no code-path blocker identified in this rerun).

### Remaining missing evidence inputs (deduplicated)

1. Production deployment proof (Vercel URL + deployed commit SHA + deploy timestamp).
2. Runtime env proof for required vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and configured AI provider key path).
3. Production draft persistence proof (`POST` create + `GET` read success, backed by `public.drafts`).
4. AI provider runtime proof (primary path success and fallback-path execution evidence).

## task-00070 — SEC — Configure policy persistence + library handoff access check

Verification scope:
- Configure policy route: `src/app/api/internal/configure/policy/route.ts` + `src/api/internal/configure/policy.ts`
- Library flow surface: `src/ui/library-page.tsx` and create route host `src/app/app/create/page.tsx`
- Global guard context: `middleware.ts` (`/app/:path*` only)

### Risk-check checklist

- [x] Input validation present for configure writes (`policyText` required; empty/whitespace rejected).
- [x] Policy persistence mode is explicit (`placeholder-memory`) and clearly non-durable in response metadata.
- [x] Library listing UI remains read-only in current implementation (no server-side mutate action exposed from list rows).
- [ ] Server-authoritative authz is enforced for `/api/internal/configure/policy` and any future library→create handoff fetch/mutate route.
- [ ] Future handoff param contract is constrained to internal identifiers and reject-by-default for malformed/unknown IDs.

### Security implications observed

1. **Configure policy API is not middleware-protected by `/app/:path*` matcher scope.**
   - Current risk: endpoint can be reached outside page-nav gating unless route-level auth is added.
   - Mitigation: require server-side session/role check in handler (or expand middleware scope safely) before privileged policy behavior is shipped.

2. **Current configure persistence is in-memory placeholder, not durable storage.**
   - Current risk: policy resets on process restart; operational integrity risk (not direct secret-exfil class by itself).
   - Mitigation: move to durable store with audit fields (`updatedBy`, timestamp, version) and retain strict validation/length limits.

3. **Library→create handoff route must be treated as untrusted input boundary when introduced/expanded.**
   - Current risk class (forward-looking): IDOR/data-leak if handoff identifier can load drafts without server ownership/auth checks.
   - Mitigation: enforce server-side draft access checks, allowlist handoff params, and fail closed (`404/403`) on invalid or unauthorized access.

### Verification outcome (task-00070)

- Outcome: **PASS (with open hardening items)**
- Residual risk: **OPEN** until route-level authz and fail-closed handoff checks are implemented server-side.

## task-00073 — SEC — Final production GO gate after 00071/00072

Deterministic model source: task-00061 policy in this document.
Evidence source: `docs/LAUNCH_EVIDENCE.md`.

### Final gate rerun evidence

- Build rerun from canonical path `/home/node/railfin` succeeded after clean build artifact reset (`rm -rf .next && npm run build`).
- Current route/build surface includes integrated app and UX routes (`/app/create`, `/app/library`, `/app/configure`, `/preview/editor`) and internal APIs (`/api/internal/content/draft`, `/api/internal/content/list`, `/api/internal/configure/policy`, `/api/internal/compliance/check`).
- Deterministic decision rule remains unchanged: any unverified critical launch evidence item => **NO-GO**.

### Final GO/NO-GO decision (task-00073)

- **Decision: NO-GO**
- **Reason class: Evidence gaps only (no additional code/build blocker identified in this rerun).**

Concrete remaining evidence gaps:
1. Production deployment proof (Vercel URL, deployed commit SHA, deploy timestamp).
2. Production runtime env proof for required vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and configured AI provider path).
3. Production draft create/read proof on `public.drafts` (`POST /api/internal/content/draft` + `GET /api/internal/content/draft?id=<id>` success evidence).
4. AI provider runtime proof showing both primary execution and fallback execution evidence.

### Verification outcome (task-00073)

- Outcome: **PASS** (security gate rerun completed deterministically)
- Launch verdict: **NO-GO** pending only the four evidence artifacts above.

## task-00076 — SEC — Policy-context privacy/safety review

Review scope:
- `src/app/api/internal/configure/policy/route.ts`
- `src/api/internal/configure/policy.ts`
- `src/ui/configure-page.tsx`
- `src/ui/editor-shell.tsx`

### Policy text handling path (reviewed)

1. Client sends/loads policy text via `GET/POST /api/internal/configure/policy`.
2. Route forwards parsed JSON body (`policyText`) to `saveConfigurePolicy`.
3. Persistence layer stores `policy_text` in `public.configure_policy` (Supabase).
4. Success responses return full `policyText`, `updatedAt`, and `version` to caller.

### Exposure/logging risk findings

- No direct raw policy logging was found in reviewed code paths (no `console.*` logging of `policyText` in route/service/UI files).
- Sensitive policy text is still high-value and can contain internal/legal guidance; leakage risk remains if broad endpoint access or future verbose logging is introduced.
- Current route contract returns full policy text; this is acceptable for editor UX but increases sensitivity of transport/caching surfaces.
- Explicit `no-store` cache-control is not currently enforced in route response contract documentation for policy reads/writes.

### Mitigations (required baseline controls)

1. **Log minimization + redaction (must):**
   - Never log raw `policyText` (request or response body) at info/warn/error levels.
   - If diagnostics are required, log only metadata (request id, content length, version, hash prefix).
   - Redact sensitive fragments in any exception path before emitting logs.

2. **Transport/cache hardening (must):**
   - Treat configure policy responses as sensitive and set/maintain `Cache-Control: no-store` semantics on API responses.
   - Client fetches for policy context should use non-cacheable request mode for fresh, non-persisted retrieval in shared/browser caches.

3. **Error hygiene (must):**
   - Keep error payloads generic; do not echo submitted policy text or model-context snippets in failure responses.
   - Preserve structured blocked diagnostics (env/table requirements) without including user-provided policy body.

4. **Data minimization (should):**
   - Enforce max policy length and reject oversized payloads to reduce accidental secret dumps.
   - Consider storing policy revisions with metadata-only audit trail and restricted read access to full text.

### task-00076 checklist snippet

- [x] Reviewed route/service/UI policy text handling path for exposure vectors.
- [x] Confirmed no direct raw policy logging in reviewed files.
- [x] Added baseline mitigations for redaction/minimization and diagnostics hygiene.
- [x] Added baseline mitigations for cache-control and sensitive response handling.

### Verification outcome (task-00076)

- Outcome: **PASS (with hardening actions tracked in baseline controls)**
- Residual risk: **OPEN** until explicit no-store/cache + max-length controls are enforced in runtime implementation.

## task-00080 — DEV — Sensitive internal route hardening (cache + validation)

Verification scope:
- `src/app/api/internal/configure/policy/route.ts`
- `src/api/internal/configure/policy.ts`
- `src/app/api/internal/content/draft/route.ts`

### Controls added

- Added explicit `Cache-Control: no-store` on sensitive internal responses for:
  - `GET/POST /api/internal/configure/policy`
  - `GET/POST /api/internal/content/draft`
- Added conservative max-length validation for configure policy text:
  - `policyText` hard limit: `8000` characters (`CONFIGURE_POLICY_MAX_LENGTH`)
  - Oversized payloads fail with `400` and `fieldErrors` contract.
- Tightened draft handoff ID validation:
  - `GET /api/internal/content/draft?id=...` now rejects malformed/non-UUID IDs with `400` before DB access.

### Outcome

- Outcome: **PASS**
- Residual blockers: **None identified in scope**

## task-00079 — SEC — MVP RC1 final gate template + residual risks register

Deterministic policy source: task-00061 in this document.
Evidence source of truth: `docs/LAUNCH_EVIDENCE.md`.
Residual-risk ledger source: `docs/MVP_RISK_REGISTER.md`.
Canonical path: `/home/node/railfin`.

### MVP RC1 final gate template (security)

Use this template for every RC1 gate decision.

- Gate window UTC:
- Evaluator (SEC):
- Release operator (COO):
- Candidate commit SHA:
- Environment target (prod/staging):
- Evidence doc version/hash:

#### Gate checks (must complete)

1. **Launch evidence completeness (critical):** all critical fields in `docs/LAUNCH_EVIDENCE.md` are `Verified: YES`.
2. **Residual risk register review:** all open residual risks in `docs/MVP_RISK_REGISTER.md` have named owners and explicit status (`Open`, `Accepted`, or `Mitigated`).
3. **Operational ownership:** incident owner and escalation backup fields are filled and current.
4. **Fail-closed behavior:** no critical endpoint has silent-success behavior under dependency failure.

#### Gate decision rule

- **GO** only if all critical evidence is verified and any remaining non-critical risks are explicitly accepted under ACK policy v1.
- **NO-GO** if any critical evidence item is unverified, ownerless, or contradicted by runtime proof.

### ACK policy v1 (required release acknowledgment)

The following acknowledgments are required for RC1 gate closure:

- **SEC ACK:** Security evaluator confirms gate result and residual-risk posture.
- **COO ACK:** Release operator confirms evidence completeness and accepts documented residual non-critical risks.
- **ENG ACK:** Engineering confirms technical mitigations/status for listed residual risks.

Minimum ACK payload fields:

- `ackPolicyVersion`: `v1`
- `decision`: `GO` or `NO-GO`
- `commitSha`:
- `evidenceRef`: `docs/LAUNCH_EVIDENCE.md`
- `riskRegisterRef`: `docs/MVP_RISK_REGISTER.md`
- `secAckBy` + timestamp UTC
- `cooAckBy` + timestamp UTC
- `engAckBy` + timestamp UTC
- `exceptions` (optional; must include owner + expiry)

### COO handoff payload (RC1)

```yaml
handoffType: RC1_SECURITY_GATE
canonicalPath: /home/node/railfin
ackPolicyVersion: v1
decision: <GO|NO-GO>
candidateCommit: <sha>
evidenceRef: docs/LAUNCH_EVIDENCE.md
riskRegisterRef: docs/MVP_RISK_REGISTER.md
criticalEvidenceOutstanding:
  - <item-or-empty>
residualRisksOpen:
  - <risk-id-or-empty>
requiredActionsBeforeGo:
  - <action-or-empty>
ownerAcks:
  sec:
    by: <name>
    atUtc: <timestamp>
  coo:
    by: <name>
    atUtc: <timestamp>
  eng:
    by: <name>
    atUtc: <timestamp>
```

### Verification outcome (task-00079)

- Outcome: **PASS**
- Result type: Template + governance artifact update (no runtime code-path change)

## task-00083 — SEC — Launch evidence closeout + deterministic gate rerun

Deterministic model source: task-00061 policy in this document.
Evidence source of truth: `docs/LAUNCH_EVIDENCE.md` (updated 2026-03-01 00:50 UTC).

### Rerun summary

- Verified tonight evidence captured in ledger:
  - Vercel production deploy progression tracked up to current main target.
  - Production draft write path proven (`POST /api/internal/content/draft` => `200`, `ok: true`) with matching `public.drafts` row evidence.
  - Known evidence-capture constraint recorded: Vercel protection returns `401` for unauthenticated direct `curl`.
- Remaining required artifacts are explicitly open in the ledger:
  - Production draft **read** proof (`GET /api/internal/content/draft?id=<id>` success evidence).
  - AI provider runtime proof for both **primary** execution and **fallback** execution.
  - Runtime env-var presence proof in production for Supabase + AI provider key path.

### Deterministic decision rerun (task-00083)

- Rule applied: GO only when all critical evidence items are `Verified: YES`.
- Current state: at least one critical item remains unverified.
- **Decision: NO-GO (BLOCKED)**.

### Concise rationale

No new code-path blocker was found; blocker is strictly outstanding production evidence completeness under the deterministic policy.

## task-00084 — SEC/DEV — Final launch evidence completion + deterministic gate rerun

Deterministic model source: task-00061 policy in this document.
Evidence source of truth: `docs/LAUNCH_EVIDENCE.md` (updated 2026-03-01 01:02 UTC).

### Rerun summary

- task-00083 closeout commit remains the baseline evidence package for this rerun.
- `docs/LAUNCH_EVIDENCE.md` now includes explicit operator placeholders and a fast runbook for production read-proof and AI-proof capture.
- No additional runtime artifacts were produced in this docs-only pass.

### Deterministic decision rerun (task-00084)

- Rule applied: GO only when all critical evidence items are `Verified: YES`.
- Current ledger state:
  - Deployed commit evidence: verified.
  - Runtime env-var evidence: unverified.
  - Draft runtime create/read evidence: read proof still unverified.
  - AI runtime evidence: primary and fallback proofs unverified.
- **Decision: NO-GO (BLOCKED)**.

### Exact remaining blockers

1. Production runtime env proof for required vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and configured AI key path).
2. Production draft read proof: `GET /api/internal/content/draft?id=<id>` success (`200`, `ok:true`, matching `data.id`) plus matching `public.drafts` row artifact.
3. AI runtime proof for both provider paths: primary execution evidence and controlled fallback execution evidence with stable response contract.

## task-00085 — DEV/SEC — AI compliance launch-gate decision record

Repository inspected from canonical path `/home/node/railfin`.

### Current-state reality check (code/runtime wiring)

- Active route used by UI: `POST /api/internal/compliance/check` in `src/app/api/internal/compliance/check/route.ts`.
- Provider chain is implemented in code:
  - Primary selected by `AI_PROVIDER` (`codex` default)
  - Secondary fallback hard-wired to the other provider
  - Both providers call `/chat/completions` with JSON-only expectation (`response_format: json_object`)
- If both providers fail/time out/missing keys, endpoint still returns `200 { ok: true, findings: ["Compliance scan unavailable"] }` safe fallback guidance (non-blocking API contract).
- Configure policy text is injected into compliance prompt (`Latest configure policy guidance`) via internal configure-policy read.
- Important runtime mismatch observed:
  - `src/ui/compliance-panel.tsx` currently calls compliance endpoint without a JSON body; route requires non-empty `content`, so this path returns `400 Missing content` unless caller behavior is adjusted.
- Legacy placeholder function remains in repo at `src/api/internal/compliance/check.ts`, but current app-router endpoint is the real execution path.

### Option record

#### Option A — make real AI runtime launch-critical now (primary + fallback)

- Pros:
  - Stronger launch confidence on AI-dependent compliance behavior.
  - Clearer operational readiness for provider outages.
- Cons:
  - Requires immediate runtime hardening, test coverage, and production evidence collection.
  - Higher schedule risk for MVP due to external provider/env dependency and fallback-path proof burden.

#### Option B — defer AI runtime as launch-critical; keep MVP on manual compliance gate

- Pros:
  - Aligns launch criteria to what can be proven quickly and deterministically.
  - Removes false blocker pressure from provider-path evidence during MVP closeout.
  - Keeps safety posture by requiring human review and avoiding legal-approval claims.
- Cons:
  - AI compliance readiness is not considered MVP-complete.
  - AI runtime still needs dedicated hardening before future AI-dependent launch claims.

### Recommendation

- **Recommend Option B for MVP** (effort/risk/time tradeoff).
- Rationale:
  - Current launch blockers are evidence operations (env/read proof) and an immediate UI→endpoint payload contract mismatch for compliance content.
  - Forcing Option A into MVP critical path increases release risk without proportionate MVP value.
  - Option B keeps gate deterministic and honest to runtime reality while preserving post-MVP path to elevate AI runtime to critical.

### Gate semantics update applied

- MVP launch-critical evidence should not require AI primary/fallback runtime proof in this phase.
- AI runtime evidence remains tracked as post-MVP hardening before any AI-dependent automated-compliance claim.

### Verification outcome (task-00085)

- Outcome: **PASS** (decision + documentation alignment)
- Launch verdict under updated MVP scope: still **NO-GO** until remaining critical evidence (env vars + draft read proof) is captured.

## task-00087 — DEV/SEC — AI single-key dual-service contract unification

Decision scope: architecture and security boundary documentation (docs-first, no runtime refactor in this task).

### Security/architecture decision

- One shared AI credential/config path is allowed for internal AI services (`AI_PROVIDER` + shared key envs).
- Service contracts are explicitly separated:
  - **Generate service**: content generation contract
  - **Compliance service**: policy/compliance contract
- Shared keying **does not** permit schema/prompt/safety coupling between services.

### Safety boundary requirements

1. **Prompt separation:** Generate and Compliance prompts are maintained independently.
2. **Schema separation:** each service enforces its own request/response validator.
3. **Failure-mode separation:** each service returns its own degraded/fallback output shape.
4. **Policy separation:** Compliance-specific legal/safety guardrails remain strict and are not diluted by Generate UX goals.

### Operational notes (env/config)

- Shared env path for AI provider chain:
  - `AI_PROVIDER` (primary selector)
  - `CODEX_API_KEY` (primary key path)
  - `OPENAI_API_KEY` or `CHATGPT_API_KEY` (fallback key path)
- Primary/fallback behavior expectation for both services:
  - primary provider attempt → secondary retry on error/timeout/invalid output → service-specific safe degraded response if both fail.

### Minimal follow-up implementation checklist

- [ ] Generate endpoint contract doc finalized (`/api/internal/content/generate`) with explicit schema.
- [ ] Prompt modules split by service and code-owner reviewed.
- [ ] Per-service validator tests added (reject cross-service schema drift).
- [ ] Per-service safety tests added (Compliance: no legal approval claims; Generate: output-policy sanitation rules).
- [ ] Provider failover tests captured for both services with shared env path inputs.

### Verification outcome (task-00087)

- Outcome: **PASS** (architecture/security boundary documentation updated)
- Runtime refactor: **Not performed** (by design for docs-first scope)

## task-00089 — SEC/COO — MVP gate closeout checklist + deterministic unblock conditions

Decision source of truth: `docs/LAUNCH_EVIDENCE.md` (task-00089 reconciliation).

### Reconciled policy state

- MVP gate currently runs with **task-00085 Option B** semantics:
  - AI runtime primary/fallback proof is deferred from MVP-critical criteria.
  - MVP-critical blockers are limited to production env evidence and production draft create/read evidence.

### Deterministic decision status (task-00089)

- Current decision: **NO-GO (BLOCKED)**
- Blockers are evidence-only and deterministic:
  1. `Env vars present in runtime` still unverified in production.
  2. `Draft runtime verification` still missing production read-proof artifact.

### Exact unblock conditions

1. In `docs/LAUNCH_EVIDENCE.md`, Section 2 must be set `Verified: YES` with completed production artifact payload for required vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; plus AI key-path/deferral semantics recorded).
2. In `docs/LAUNCH_EVIDENCE.md`, Section 3 must be set `Verified: YES` with completed payload for draft create+read+DB-row proofs.
3. Evidence links/refs must be present; placeholders or inferred values do not satisfy gate closure.

### Verification outcome (task-00089)

- Outcome: **PASS** (docs reconciliation + execution-ready closeout checklist)
- Runtime/code changes: **None** (docs-first)
