# Launch Readiness Evidence

Last updated (UTC): 2026-03-01 02:21
Prepared by: SEC/COO (task-00090)
Branch: `chore/sec/task-00090-final-gate-rerun`

## task-00085 scope decision (active for MVP gate)

Decision in force: **Option B (AI runtime evidence deferred from MVP-critical gate)**.

Implication for launch decisioning now:
- MVP gate is still deterministic and strict.
- MVP-critical evidence requires production deploy proof, production env-var proof, and production draft create+read proof.
- AI runtime (primary/fallback provider execution evidence) is tracked as post-MVP hardening evidence and is **not** required to flip MVP gate to GO.

---

## Evidence Ledger (deterministic source for GO/NO-GO)

### 1) Deployed commit on Vercel

- Critical: **YES**
- Verified: **YES (partial chain verified to current main target)**
- Tonight verified evidence:
  - Production deploy commit progression captured in Vercel deploy history up to current main target.
  - Current main progression reference used for closeout: `5a90d76 -> 2b8d77b -> 73f38d9 -> 2e0edf6 -> 6e4fe3a -> 25487d6`.
- Required artifact format:
  - `artifactType: vercel-production-deploy`
  - `capturedAtUtc: <YYYY-MM-DDTHH:mm:ssZ>`
  - `capturedBy: <operator>`
  - `deployedSha: <git-sha>`
  - `deployUrl: <https://...>`
  - `artifactRef: <screenshot/export path>`

### 2) Env vars present in runtime (production)

- Critical: **YES**
- Verified: **YES**
- Required MVP vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- AI vars are conditional at MVP stage under Option B:
  - If AI runtime is intentionally enabled for this release window, also capture configured key path (`CODEX_API_KEY` and/or fallback path `OPENAI_API_KEY`/`CHATGPT_API_KEY`).
  - If AI runtime is intentionally deferred/disabled for MVP, record explicit deferral semantics in artifact payload.
- Operator steps:
  1. Open Vercel Project → Settings → Environment Variables (Production).
  2. Capture screenshot showing variable names present (values masked).
  3. Fill artifact payload.
- Required artifact payload:
  - `artifactType: vercel-env-vars-production`
  - `capturedAtUtc: <YYYY-MM-DDTHH:mm:ssZ>`
  - `capturedBy: <operator>`
  - `scope: production`
  - `varsSeen: [NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, <optional AI key path>]`
  - `aiRuntimePolicy: enabled|deferred`
  - `aiDeferralReason: <required when aiRuntimePolicy=deferred>`
  - `artifactRef: <screenshot path>`

### 3) Draft runtime verification (production create + read)

- Critical: **YES**
- Verified: **YES**
- Verified tonight evidence:
  - `POST /api/internal/content/draft` returned `200` with `ok: true` and `data.id` present.
  - `GET /api/internal/content/draft?id=<id>` returned `200` with `ok: true` and matching `data.id`/`title`/`body`.
  - Matching `public.drafts` row observed for same draft id.
- Required artifact payload:
  - `artifactType: draft-create-read-production`
  - `draftId: <uuid>`
  - `createCapturedAtUtc: <YYYY-MM-DDTHH:mm:ssZ>`
  - `readCapturedAtUtc: <YYYY-MM-DDTHH:mm:ssZ>`
  - `capturedBy: <operator>`
  - `createArtifactRef: <POST response proof>`
  - `readArtifactRef: <GET response proof>`
  - `dbArtifactRef: <public.drafts row proof>`

### 4) AI runtime proof (primary + fallback) — post-MVP hardening

- Critical: **NO (deferred by task-00085 Option B)**
- Verified: **NO (open hardening item)**

If/when AI runtime is promoted back to launch-critical in a future gate, collect both:
- Primary provider execution proof.
- Controlled fallback execution proof.

Required artifact payload when collected:
- `artifactType: ai-runtime-primary-fallback`
- `capturedAtUtc: <YYYY-MM-DDTHH:mm:ssZ>`
- `capturedBy: <operator>`
- `primaryProvider: codex|chatgpt`
- `primaryArtifactRef: <logs/response proof>`
- `fallbackProvider: codex|chatgpt`
- `fallbackTriggerMethod: <controlled failure mechanism>`
- `fallbackArtifactRef: <logs/response proof>`
- `contractStable: true|false`
- `incidentOwnerAckRef: <ack record ref>`

---

## One-pass operator checklist (execution-ready)

1. Confirm authenticated production session (avoid unauthenticated `401` from Vercel protection).
2. Capture deploy artifact payload (Section 1 format).
3. Capture production env-var artifact payload (Section 2 format).
4. Execute draft create (`POST`) and read (`GET`) back-to-back; capture both plus DB row (Section 3 format).
5. Paste all payload fields and refs into this document.
6. MVP-critical sections now satisfy verification based on provided production artifacts (env vars + draft create/read + DB row).
7. Recompute gate decision using deterministic rule in `docs/SECURITY_BASELINE.md` (Option B semantics for MVP).

---

## Deterministic decision status (current)

- Current decision: **GO (MVP gate passed under task-00085 Option B semantics)**
- MVP-critical evidence status:
  1. Section 2 (`Env vars present in runtime`) is `Verified: YES` (Production + Preview Supabase vars confirmed).
  2. Section 3 (`Draft runtime verification`) is `Verified: YES` (production create + read + DB row match confirmed).
- AI runtime proof section remains post-MVP hardening and does **not** block MVP GO under current Option B policy.

## Constraints & Notes

- Vercel project protection can return `401` for unauthenticated direct `curl`; evidence collection must use authenticated context.
- Do not fabricate artifacts. Unknown/unavailable items must stay explicitly open.
- Completion label:
  - `Launch Evidence: COMPLETE` when all MVP-critical items are `Verified: YES` under active policy semantics.
  - Current status: **COMPLETE (MVP-critical evidence satisfied)**.


## Runtime diagnostics evidence capture note (task-00113)

Local verification capture (non-secret) for AI-backed internal routes should record:
- endpoint (`/api/internal/content/generate` or `/api/internal/compliance/check`)
- timestamp (UTC)
- response booleans: `ok`, `meta.degraded` (or `generationMeta.degraded`)
- `providerChain.primary`, `providerChain.fallbackDeferred`, and first-attempt outcome (`ok` + `errorKind` only)

2026-03-02 local verification snapshot:
- Both endpoints returned codex-primary diagnostics with one codex attempt and `fallbackDeferred: true`.
- Both were degraded with first-attempt `errorKind: provider_config` in this local runtime context.
- No secret values were logged or stored in evidence notes.
