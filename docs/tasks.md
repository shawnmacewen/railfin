## task-00147 — UI/DEV — Create single-content focus + prompt lock accordion + editor/compliance upgrade

- Status: **Done**
- Branch: `feat/ui/task-00147-create-single-content-focus-and-editor-upgrade`
- Scope delivered:
  - Removed Create "Mode" controls and focused generation UX on single-content flow only.
  - Moved generation action beside prompt lock and renamed action to **Generate Content**.
  - Added prompt lock accordion behavior (lock + collapse/minimize with explicit expand control).
  - Increased editor working area significantly for content drafting/remediation review.
  - Added right compliance panel collapse-to-rail UX with visible top maximize control.
  - Added minimal rich-text options in editor toolbar: **bold**, **italic**, and **text color**.
  - Preserved existing save/compliance/remediation/history-restore workflows with no API contract changes.
  - Updated UI/docs/changelog and re-ran `npm run build` (pass).

## task-00146 — UI — Library tile layout and metadata refinement

- Status: **Done**
- Branch: `feat/ui/task-00146-library-tile-layout-and-description`
- Scope delivered:
  - Updated Library saved items to responsive tile grid layout with desktop 4-column presentation and smaller-screen fallback.
  - Refined tile proportions to feel more square/card-like instead of tall list rows.
  - Updated date metadata text to explicit `Created: <date>` format.
  - Added per-tile **Description** section beneath date metadata.
  - Applied description preview rules: max 3 visible lines with ellipsis truncation for overflow.
  - Preserved Library → Create open/edit handoff behavior via existing `draftId` query flow.
  - Updated docs/changelog and re-ran `npm run build` (pass).

## task-00145 — UI — Create-page UX polish follow-up

- Status: **Done**
- Branch: `feat/ui/task-00145-create-ux-polish-followup`
- Scope delivered:
  - Removed Create workflow shortcut row (Generate / Review / Remediate / Save).
  - Reduced platform corner radius to a 2px baseline for core controls/cards/pills to avoid over-rounded styling.
  - Kept **Campaign Package** visible in mode controls but disabled/non-selectable with explicit non-interactive affordance.
  - Rendered content-type options (Blog, Social Post, Article, Newsletter) on a single row.
  - Removed the explicit `1. Generate` label from the Generate stage.
  - Preserved generation/save/compliance/remediation behavior and existing endpoint contracts.
  - Updated docs/changelog and re-ran `npm run build` (pass).

## task-00144 — UI/DEV — Create page UX refactor (specific product-owner requests)

- Status: **Done**
- Branch: `feat/ui/task-00144-create-page-ux-refactor-specific`
- Scope delivered:
  - Removed deprecated helper/instruction copy in Create Generate header and Generate section.
  - Moved Draft Status into a right-aligned header pill for faster at-a-glance save-state visibility.
  - Split generation controls into separate **AI Instructions** input and **Editor Content** output areas.
  - Added prompt lock/unlock behavior and retained the last submitted prompt in-session for user reference after generation.
  - Replaced mode radio controls with two large selectable buttons (Single Draft / Campaign Package) with explicit active state.
  - Replaced content-type selector with four rectangular choices only: Blog, Social Post, Article, Newsletter (removed LinkedIn/X-thread labels from selector).
  - Removed visible "Primary Output" and "4. Save" labels; moved Generation History to the bottom of the Create workflow.
  - Updated UI docs/changelog and re-ran `npm run build` (pass).
- Follow-up milestone (explicit):
  - Every AI prompt submission must be persisted with user linkage (user/session/model identity). Current UI-only prompt lock is in-session reference only; backend audit persistence with full user linkage remains a required next implementation milestone.

## Change log contribution rule (effective immediately)

- Every shipped feature, fix, security change, or docs-visible behavior update **must** include a human-readable entry in `docs/CHANGELOG.md` as part of the same PR/task.
- Entries should be concise, dated (`YYYY-MM-DD`), and understandable by non-engineers.
- Tasks are not considered complete until both `docs/tasks.md` and `docs/CHANGELOG.md` are updated when applicable.

## task-00142 — UI/DEV — Configure Features subpage

- Status: **Done**
- Branch: `feat/ui/task-00142-config-features-subpage`
- Scope delivered:
  - Added Configure subpage route `/app/configure/features` and included it in Configure subnav alongside Policy and Change Log.
  - Added a human-readable Features page with grouped bullet lists of current capabilities (generation controls, package mode, compliance checks, manual remediation with undo, draft/library workflows, generation history restore/compare, and changelog visibility).
  - Kept UI style aligned with existing `rf-*` Configure patterns via additive `rf-feature-*` styling only.
  - Updated docs (`docs/UI_FOUNDATIONS.md`, `docs/CHANGELOG.md`) and re-ran `npm run build` (pass).

## task-00141 — SEC — post-alignment safety check

- Status: **Done**
- Branch: `chore/sec/task-00141-post-alignment-safety-check`
- Scope delivered:
  - Re-checked task-00134 package-mode API/UX drift status against current Create generation flow and generate API contract.
  - Confirmed UX phase2 safety-critical surfaces remain visible (degraded-status messaging, legal-disclaimer copy, protected-zone warnings).
  - Confirmed remediation controls remain explicit/manual-only (`Apply Selected Context`, `Apply + Regenerate Draft`, `Undo Last Apply`) with no auto-trigger regression.
  - Recorded gate outcome in `docs/SECURITY_BASELINE.md`: package-alignment closure remains **NO-GO** (drift still open), while UX safety-surface posture remains **GO**.
  - Updated changelog and task ledger; docs-only verification task (no runtime code changes, no build run required).


## task-00139 — UI — UX stabilization phase 2 after split layout

- Status: **Done**
- Branch: `feat/ui/task-00139-ux-stabilization-phase2`
- Scope delivered:
  - Improved right compliance panel ergonomics with contained sticky/scroll behavior so run/status/actions remain easier to access during long findings review.
  - Reduced left-pane cognitive load by grouping generation controls progressively (Mode → Primary Output → Generate action).
  - Preserved all existing Create capabilities/flows (generate, package variants/history actions, review/remediation actions, save, compliance check).
  - Updated UI docs/changelog and re-ran `npm run build` (pass).

## task-00137 — DEV — UX stabilization support pass for split layout

- Status: **Done**
- Branch: `fix/dev/task-00137-ux-stability-support`
- Scope delivered:
  - Stabilized Create compliance selection state under persistent split layout by clearing selected finding context when editor content/policy context changes, preventing stale apply actions against out-of-date findings.
  - Hardened selected-finding propagation to parent state by requiring a live selected key and aligning effect dependencies to current selection identity.
  - Kept API contracts unchanged (`/api/internal/compliance/check`, remediation apply flow) and avoided behavior changes outside low-risk state synchronization fixes.
  - Updated changelog and re-ran `npm run build` (pass).

## task-00138 — SEC — safety check for UX layout refactor

- Status: **Done**
- Branch: `chore/sec/task-00138-ux-change-safety-check`
- Scope delivered:
  - Re-verified Create layout composition does not hide/suppress safety-critical surfaces (degraded-state notices, protected-zone warnings, legal-disclaimer messaging).
  - Confirmed remediation actions remain explicit/manual (`Apply Selected Context`, `Apply + Regenerate Draft`, `Undo Last Apply`) and are not auto-triggered by UI rearrangement.
  - Confirmed selected-finding remediation context is reset on content/context changes, preventing stale context actions after layout persistence changes.
  - Updated `docs/SECURITY_BASELINE.md` with task-00138 verification findings and gate decision (**GO for layout safety posture**).
  - Updated `docs/CHANGELOG.md` with a concise security verification note.
## task-00136 — UI — Create split layout with persistent compliance panel

- Status: **Done**
- Branch: `feat/ui/task-00136-create-layout-split`
- Scope delivered:
  - Implemented responsive Create workspace split with editor workflow on the left (~2/3) and persistent compliance panel on the right (~1/3) for desktop/tablet.
  - Added mobile-first stacked ordering with sticky workflow shortcuts to keep stage navigation low-friction.
  - Preserved existing generation/save/review/remediation/history behaviors and endpoint contracts.
  - Improved visual hierarchy to clarify sequence: Generate → Review → Remediate → Save.
  - Updated UI docs and changelog; re-ran `npm run build` (pass).


## task-00135 — DEV/UI — Configure Change Log subpage

- Status: **Done**
- Branch: `feat/dev/task-00135-config-changelog-subpage`
- Scope delivered:
  - Added a new Configure subpage at `/app/configure/changelog` and a Configure section subnav (`Policy`, `Change Log`) for discoverability.
  - Added `docs/CHANGELOG.md` as a human-readable, dated release history source and rendered it in-app on the new Change Log page.
  - Backfilled major milestones from MVP foundation through latest package-workflow releases in concise non-engineering language.
  - Added an explicit process rule requiring all future shipped changes to include a `docs/CHANGELOG.md` entry.
  - Re-ran `npm run build` (pass).

## task-00134 — SEC — package export safety review phase 1

- Status: **Done**
- Branch: `chore/sec/task-00134-package-export-safety-review`
- Scope delivered:
  - Reviewed package-mode request/response schema and Create compare UX path for leakage, metadata exposure, and over-sharing risks.
  - Documented concrete findings: package runtime active, API/UX contract drift (package schema vs single-mode fan-out), and metadata over-sharing surfaces (prompt/per-asset preview/provider diagnostics fields).
  - Added required sanitization checklist + explicit phase-1 acceptance criteria in `docs/SECURITY_BASELINE.md` as pre-enablement gate for package export/compare flows.
  - Recorded security gate as **NO-GO** until sanitization controls and contract alignment are complete.
  - Docs-only security task; no runtime code changes and no build run required.

## task-00132 — DEV — campaign package export schema phase 1

- Status: **Done**
- Branch: `feat/dev/task-00132-package-export-schema-phase1`
- Scope delivered:
  - Added additive package export payload under `data.package.export` with schema versioning, per-asset metadata, and normalized content blocks for downstream tooling.
  - Preserved existing package response shape (`package.assets[]` + top-level `generationMeta`) for backward compatibility while extending response data.
  - Added strict export assembly validation (schema version, asset cardinality, unique asset types, non-empty content fields, and block validation).
  - Extended generation validation tests to assert export payload presence and normalized block structure.
  - Updated API boundary docs and re-ran `npm run build` (pass).

## task-00129 — DEV — campaign package generator phase 1

- Status: **Done**
- Branch: `feat/dev/task-00129-campaign-package-generator-phase1`
- Scope delivered:
  - Extended `POST /api/internal/content/generate` to support additive `mode: "package"` payloads with multi-asset generation in one request (`email`, `linkedin`, `x-thread`) while preserving existing default single-draft behavior.
  - Added strict package-mode and per-asset validation (field exclusivity, shape allowlists, unique asset types, bounded prompt constraints).
  - Preserved backward compatibility for existing single-mode request/response contracts.
  - Updated API boundary docs for package-mode contract and validation semantics.
  - Re-ran `npm run build` (pass).

## task-00133 — UI — package variant compare UX phase 1

- Status: **Done**
- Branch: `feat/ui/task-00133-package-variant-compare-ux`
- Scope delivered:
  - Added side-by-side package variant compare rendering in Create Generation History for multi-variant outputs.
  - Added quick per-variant **Copy** and **Restore** actions to accelerate reuse while preserving existing history/remediation workflows.
  - Kept UX aligned to existing `rf-*` conventions with targeted additive styling only (no broad redesign).
  - Updated `docs/UI_FOUNDATIONS.md` and reran `npm run build` (pass).

## task-00130 — UI — campaign package UX phase 1

- Status: **Done**
- Branch: `feat/ui/task-00130-campaign-package-ux-phase1`
- Scope delivered:
  - Added Create generation mode controls for **Single draft** vs **Campaign package** (multi-variant generation).
  - Added structured Generation History cards that preserve package context and list per-variant restore actions.
  - Kept existing save/history/compliance/review flows intact while extending generation UX with existing `rf-*` patterns.
  - Updated `docs/UI_FOUNDATIONS.md` and reran `npm run build` (pass).

## task-00131 — SEC — package-mode safety review phase 1

- Status: **Done**
- Branch: `chore/sec/task-00131-package-mode-safety-review`
- Scope delivered:
  - Reviewed current generation/runtime surfaces for any active multi-asset package-mode behavior and verified current contract remains single-draft output oriented.
  - Documented phase-1 safety findings for package-mode risk classes (cross-asset leakage and risky copy amplification) in `docs/SECURITY_BASELINE.md`.
  - Added mandatory pre-enablement package-mode guardrail checklist entries (per-asset isolation, bounded batch/output, per-asset auditability, sensitive-zone protections, preview/confirm flow, fail-closed degraded handling).
  - Recorded package-mode gate decision as **NO-GO (pre-implementation guardrail gate)** until required controls are implemented.
  - Docs-only review task; no runtime code changes and no build run required.


## task-00126 — DEV — remediation audit trail persistence phase 1

- Status: Done
- Branch: `feat/dev/task-00126-remediation-audit-trail-persistence`
- Summary:
  - Persisted remediation audit structures for draft metadata/history in Supabase draft layer.
  - Extended remediation audit payload shape with event id + undo linkage id.


## task-00123 — DEV — auto-remediation engine phase 2 hardening

- Status: ✅ Done
- Branch: `feat/dev/task-00123-auto-remediation-engine-phase2`
- Summary:
  - Added prohibited-transform enforcement for legal/disclaimer/citation-sensitive regions in remediation apply path.
  - Refined bounded edit-size enforcement to use true changed-region calculations (chars + lines) rather than simple length delta.
  - Added one-step undo token flow (session-scoped, non-persistent) with new undo endpoint for last apply operation.
  - Preserved manual-trigger-only remediation behavior and existing request contracts (backward compatible additive fields only).

# Tasks

## task-00127 — UI — review workbench tidy pass 1 (pre-UX cleanup)

- Status: **Done**
- Branch: `feat/ui/task-00127-review-workbench-tidy-pass1`
- Scope delivered:
  - Reduced visual clutter in Create Review Workbench while preserving existing selected-finding remediation capabilities.
  - Improved hierarchy/spacing for selected-finding details/actions, protected-zone warning visibility, and session apply history readability.
  - Tightened Generation History presentation for faster scan without flow changes.
  - Kept implementation aligned to existing `rf-*` conventions with no broad redesign.
  - Updated `docs/UI_FOUNDATIONS.md` and re-ran `npm run build` (pass).

## task-00124 — UI — remediation UX phase 2

- Status: **Done**
- Branch: `feat/ui/task-00124-remediation-ux-phase2`
- Scope delivered:
  - Added explicit manual one-step **Undo Last Apply** action in Create Review Workbench (`src/ui/editor-shell.tsx`).
  - Added clearer warnings for selected findings in protected/prohibited transform zones (legal/disclaimer, citation/attribution, compliance metadata) in both selected-finding and finding-card UX (`src/ui/compliance-panel.tsx`, `src/ui/editor-shell.tsx`).
  - Preserved all existing create/save/generate/compliance/history flows and kept UI updates aligned with existing `rf-*` conventions.
  - Updated `docs/UI_FOUNDATIONS.md` and re-ran `npm run build` (pass).

## task-00121 — UI — auto-remediation UX phase 1

- Status: **Done**
- Branch: `feat/ui/task-00121-auto-remediation-ux-phase1`
- Scope delivered:
  - Added explicit manual-only apply affordance for auto-remediation in Create Review Workbench (single selected finding context only).
  - Added clearer before/after remediation preview summary (changed chars/lines when available) and stronger operator status feedback during apply.
  - Preserved existing generation/save/compliance/history workflows and endpoint contracts.
  - Kept UI changes aligned with existing `rf-*` naming/style patterns.
  - Updated `docs/UI_FOUNDATIONS.md` and re-ran `npm run build` (pass).

## task-00122 — SEC — verification pass for auto-remediation phase 1 changes

- Status: **Done**
- Branch: `chore/sec/task-00122-auto-remediation-verification`
- Scope delivered:
  - Verified phase-1 remediation workflow implementation against task-00119 safety baseline controls.
  - Confirmed flow remains user-initiated/single-draft and does not auto-save or auto-publish side effects.
  - Validated residual gaps for auto-remediation enablement remain open: prohibited-transform enforcement, deterministic audit record completeness, bounded edit-size limits, and one-step undo.
  - Updated `docs/SECURITY_BASELINE.md` with explicit verification outcome and gate decision (**NO-GO for auto-remediation enablement until controls complete**).
  - Docs-only verification task; no runtime code changes and no build run required.


## task-00125 — SEC — remediation safety gate rerun after phase-2 changes

- Status: **Done**
- Branch: `chore/sec/task-00125-remediation-gate-rerun`
- Scope delivered:
  - Re-ran SEC verification for task-00122 residual auto-remediation gaps against current merged code.
  - Confirmed prohibited-transform enforcement, deterministic audit record fields, and bounded edit-size limits are now implemented in remediation apply path.
  - Confirmed required one-step undo for last remediation apply action is still not explicitly implemented.
  - Re-evaluated gate status as **NO-GO** until undo control is completed.
  - Updated `docs/SECURITY_BASELINE.md` with task-00125 verification notes and decision rationale.
  - Docs-only verification task; no runtime SEC code changes and no build run required.

## task-00128 — SEC — remediation safety gate rerun after phase-2 completion

- Status: **Done**
- Branch: `chore/sec/task-00128-remediation-gate-rerun-after-undo`
- Scope delivered:
  - Re-checked all task-00122/task-00125 residual NO-GO criteria against latest `main`.
  - Confirmed prohibited-transform enforcement, deterministic audit fields, and bounded edit-size controls remain enforced in remediation apply path.
  - Confirmed explicit one-step manual `Undo Last Apply` control now exists in Create Review Workbench and restores prior in-memory draft state session-locally.
  - Re-evaluated residual remediation safety gate status to **GO** (all previously blocking criteria now closed).
  - Updated `docs/SECURITY_BASELINE.md` with task-00128 verification evidence and gate decision.
  - Docs-only verification task; no runtime SEC code changes and no build run required.


## task-00120 — DEV — auto-remediation engine phase 1 (safe scoped)

- Status: **Done**
- Branch: `feat/dev/task-00120-auto-remediation-engine-phase1`
- Scope delivered:
  - Added backend apply endpoint `POST /api/internal/compliance/remediation/apply` for single selected finding remediation in current draft context only (no persistence side effects).
  - Enforced fail-closed validation for required selected finding + draft context identity, with explicit `Validation failed` + `fieldErrors` responses.
  - Enforced bounded edit guardrails (max changed chars/lines) and deterministic controlled remediation-block replacement (no hidden transforms).
  - Added structured audit metadata generation (UTC timestamp, actor, draft context id, finding id, before/after snippet hash, bounded diff summary, outcome).
  - Updated Create review workflow to call backend remediation apply path only on explicit user actions (opt-in; no automatic apply by default).
  - Updated API boundary docs and rebuilt project with `npm run build` (pass).


## task-00118 — UI — generation history panel in Create

- Status: **Done**
- Branch: `feat/ui/task-00118-generation-history-panel`
- Scope delivered:
  - Added Create generation history panel showing the most recent generated outputs for the current Create context (draft/session-scoped, capped history).
  - Added quick restore action from history entries to repopulate editor content with low-friction operator feedback.
  - Preserved save/generate/compliance/review flows and existing API contracts.
  - Added matching `rf-*` style primitives for compact history cards/actions in Create.
  - Updated UI foundations documentation and re-ran build verification (pass).
  - Updated docs/tasks.md tracking note for task-00118 completion.


## task-00117 — DEV — Prompt presets control panel backend/data support

- Status: **Done**
- Branch: `feat/dev/task-00117-prompt-presets-control-panel`
- Scope delivered:
  - Extended generate request normalization to support full preset/control-panel input set: `template`, `tone`, `intent`, `controlProfile`, `audience`, `objective`.
  - Preserved backward compatibility with existing nested fields (`preset.*`, `controls.*`) while enforcing deterministic merge rules.
  - Added strict conflict validation for mixed top-level+nested overrides and returned clear `Validation failed` + `fieldErrors` contract-safe payloads.
  - Expanded control-profile defaults and prompt composition guidance to include audience/objective dimensions.
  - Updated generate route typing, validation tests, and API boundary docs; response success/degraded contract unchanged.
  - Rebuilt project with `npm run build` (pass).


## task-00119 — SEC — safety guardrails for automated remediation apply actions

- Status: **Done**
- Branch: `chore/sec/task-00119-remediation-autofix-safety-plan`
- Scope delivered:
  - Defined mandatory safety boundaries for upcoming "apply remediation automatically" behavior: strict scope limits, prohibited transforms, deterministic auditability requirements, and fail-closed validation controls.
  - Added implementation gate checklist covering required unit/integration/negative-path/security validation before auto-remediation can be enabled.
  - Added explicit GO/NO-GO enablement rule requiring single-draft, user-confirmed, reversible behavior and complete control evidence.
  - Updated `docs/SECURITY_BASELINE.md` with the task-00119 control baseline and verification outcome.
  - Docs-only update; no runtime code changes in this task.


## task-00116 — DEV — OpenAI API primary runtime refactor for generate + compliance

- Status: **Done**
- Branch: `feat/dev/task-00116-openai-primary-refactor`
- Scope delivered:
  - Refactored shared AI runtime provider-chain to be explicitly OpenAI-first (`openai-api` primary) for both `/api/internal/content/generate` and `/api/internal/compliance/check`, with deferred fallback preserved.
  - Removed codex-primary user-facing assumptions from diagnostics/notes and updated degraded operator hints to reference `OPENAI_API_KEY` as primary credential path.
  - Updated OpenAI provider config resolution to prioritize `OPENAI_API_KEY` and OpenAI-specific env names (`OPENAI_MODEL`, `OPENAI_API_BASE_URL`) while keeping compatibility fallback envs non-primary.
  - Updated boundary/security/launch docs to reflect OpenAI-primary posture and refreshed provider evidence wording.
  - Rebuilt project with `npm run build` (pass).


## task-00113 — DEV — Codex runtime verification + quality pass

- Status: **Done**
- Branch: `feat/dev/task-00113-codex-runtime-verification`
- Scope delivered:
  - Re-ran live endpoint verification for `POST /api/internal/content/generate` and `POST /api/internal/compliance/check` against local Next runtime using internal-auth test cookie and captured provider-chain diagnostics.
  - Confirmed both endpoints remain openai-primary with deferred fallback wiring and contract-safe degraded outputs when provider configuration is unavailable.
  - Added concise evidence-capture notes for provider diagnostics in `docs/LAUNCH_EVIDENCE.md` and `docs/API_BOUNDARY.md`.
  - Applied non-breaking quality tuning to degraded-path messaging so `provider_config` failures return actionable non-secret runtime-hint text.
  - Rebuilt project with `npm run build` (pass).

## task-00114 — UI — Content + review UX polish for live AI runtime

- Status: **Done**
- Branch: `feat/ui/task-00114-content-review-ux-polish`
- Scope delivered:
  - Surfaced generation runtime outcomes in Create with explicit distinction between normal success and degraded fallback mode using existing `generationMeta` metadata.
  - Surfaced compliance runtime outcomes with explicit success vs degraded fallback status using existing `meta` diagnostics when available.
  - Added/standardized `rf-status` visual variants in shared stylesheet for low-friction status consistency.
  - Preserved existing create/save/library/review workflows and endpoint contracts.

## task-00115 — SEC — Auth compat risk guardrails

- Status: **Done**
- Branch: `chore/sec/task-00115-auth-compat-risk-guardrails`
- Scope delivered:
  - Added explicit operational checklist guardrails in `docs/SECURITY_BASELINE.md` for temporary auth compat mode (ownership, telemetry cadence, rollback readiness, retirement gate).
  - Added concrete rollback trigger criteria for compat mode disablement (`INTERNAL_API_AUTH_COMPAT_MODE=off`) under abuse/anomaly/regression/incident/strict-guard-ready conditions.
  - Re-verified internal route guard posture after recent merges: all current `src/app/api/internal/**/route.ts` handlers retain `requireInternalApiAuth` and no-store header coverage.
  - Docs-only update; no runtime code changes in this task.

## task-00110 — DEV — Content tools phase 6 (prompt scaffold audience/objective controls)

- Status: **Done (Retry completed on correct repo path: /home/node/railfin-repo)**
- Branch: `feat/dev/task-00110-content-tools-phase6`
- Scope delivered:
  - Added prompt scaffold control dimensions for generation: `controls.audience` (`executive|practitioner|general`) and `controls.objective` (`awareness|consideration|decision`).
  - Enforced strict allowlist validation with reject-by-default behavior for unknown keys/unsupported enum values; preserved safe defaults via control-profile mapping when omitted.
  - Integrated new controls into existing template/preset/control-profile stack and prompt guidance composition without changing response shape consumed by UI.
  - Updated generate route request typing, validation tests, and API boundary documentation for the expanded controls contract.

## task-00111 — UI — Review workbench phase 6 (apply + regenerate)

- Status: **Done (retry completed on correct repo path)**
- Branch: `feat/ui/task-00111-review-workbench-phase6`
- Scope delivered:
  - Added quick selected-finding workflow affordances in Create Review Workbench: `Apply Selected Context` and `Apply + Regenerate Draft`.
  - Implemented single-step apply+regenerate action that stages selected remediation context and immediately runs generation without changing endpoint contracts.
  - Preserved save/generate/compliance behavior and disclaimer/status flows; no API contract changes.
  - Added compact `rf-*` style support for review workbench action row.
  - Updated UI foundations documentation for the new review workflow.

## task-00112 — SEC — Auth compat follow-up verification + replacement plan

- Status: **Done**
- Branch: `chore/sec/task-00112-auth-compat-followup-plan`
- Scope delivered:
  - Re-verified current `requireInternalApiAuth` behavior in `src/app/api/internal/_auth.ts`: emergency compat fallback remains enabled by default (`INTERNAL_API_AUTH_COMPAT_MODE !== "off"`) and still permits trusted same-origin browser requests when no verified session is present.
  - Documented current residual risk explicitly as an auth-bypass-by-origin-signals exposure (temporary acceptance only).
  - Produced a concrete, phased replacement plan for robust server-side session verification using `getCurrentAuthContext()` + Supabase server auth context and role/claim enforcement at internal route boundary.
  - Added rollout guardrails (feature flag, staged endpoint migration, telemetry, and compat retirement criteria) in `docs/SECURITY_BASELINE.md`.
  - Docs-only update; no runtime code changes in this task.

## task-00109 — DEV — OpenAI-primary runtime wiring for generate + compliance

- Status: **Done**
- Branch: `feat/dev/task-00109-openai-primary-wiring`
- Scope delivered:
  - Pinned provider-chain runtime primary to Codex for production execution in both content generation and compliance checks.
  - Made fallback behavior explicit as deferred/non-blocking (`fallbackDeferred: true`) while preserving contract-safe degraded responses.
  - Kept UI-facing API contracts stable for `/api/internal/content/generate` and `/api/internal/compliance/check`.
  - Preserved non-secret runtime diagnostics (`providerChain` attempts + classified `errorKind`) for Codex failure analysis.
  - Updated API/security docs for Codex-first posture and deferred fallback note.

## task-00108 — DEV — Emergency authz regression rollback for internal APIs

- Status: **Done**
- Branch: `fix/dev/task-00108-emergency-authz-regression-rollback`
- Scope delivered:
  - Identified root regression in centralized internal API auth guard: strict cookie-only requirement created false negatives for valid in-app browser flows.
  - Applied emergency centralized compatibility hotfix in `src/app/api/internal/_auth.ts` to temporarily allow trusted same-origin browser requests when session cookies are absent.
  - Added env kill switch `INTERNAL_API_AUTH_COMPAT_MODE=off` for fast rollback to strict mode.
  - Kept fail-closed behavior for non-same-origin/non-browser request patterns.
  - Updated security baseline with explicit temporary-risk note and required follow-up hardening task for robust server-side session verification.

## task-00107 — DEV — Library unauthorized hotfix after internal API auth hardening

- Status: **Done**
- Branch: `fix/dev/task-00107-library-unauthorized-hotfix`
- Scope delivered:
  - Diagnosed auth mismatch between newly hardened `/api/internal/*` guards and production in-app session cookie variants (Supabase-style auth cookie names were not recognized by `requireInternalApiAuth` / middleware placeholder checks).
  - Applied minimal hotfix to restore in-app Library/Create draft read/list/open flows by expanding placeholder cookie detection to include common Supabase auth cookies (`sb-access-token`, `sb-refresh-token`, and `sb-<ref>-auth-token[.N]`).
  - Kept security posture fail-closed at route boundary (still requires auth-cookie presence; no blanket route relaxation for unauthenticated callers).
  - Added explicit `credentials: "include"` on internal app fetches in Create/Library UI flows to make cookie propagation explicit and consistent.
  - Updated security baseline docs with hotfix details and residual follow-up risk.

## task-00106 — SEC — security sweep for latest content/review additions

- Status: **Done**
- Branch: `chore/sec/task-00106-security-sweep-content-review`
- Scope delivered:
  - Re-validated generation controls/profiles path for strict allowlist validation and fail-closed handling of unsupported `template`/`preset`/`controls` values.
  - Re-validated review workbench flow behavior (Create editor + compliance panel) for fail-closed handling on missing/invalid operator inputs.
  - Re-validated internal API auth guard and sensitive-cache assumptions after merges (`requireInternalApiAuth` + `Cache-Control: no-store` on unauthorized/success/error responses).
  - Updated `docs/SECURITY_BASELINE.md` with task-00106 sweep checklist, findings, and verification outcome.

## task-00104 — DEV — Merge-safe closeout + content tools phase 5

- Status: **Done**
- Branch: `feat/dev/task-00104-content-tools-phase5`
- Scope delivered:
  - Landed task-00102 commit (`ef4ec22890f803b3ba68f7975df922423c5cc3c8`) on `main` lineage via cherry-pick during phase closeout.
  - Added reusable generation control profiles in `internalContentGenerate`: `social-quick`, `balanced-default`, and `deep-outline`.
  - Mapped `controlProfile` defaults into `controls` resolution with strict validation and preserved additive/non-breaking request semantics.
  - Preserved response contract (`{ ok, data: { draft, generationMeta } }`) and fallback behavior.
  - Extended validation coverage and updated API boundary documentation for new `controlProfile` request field.

## task-00101 — DEV — Content tools phase 4

- Status: **Done**
- Branch: `feat/dev/task-00101-content-tools-phase4`
- Scope delivered:
  - Extended `internalContentGenerate` request handling with structured output controls: `controls.lengthTarget` (`short|medium|long`) and `controls.formatStyle` (`standard|bullet|outline`).
  - Added strict validation with safe defaults for omitted control fields and reject-by-default handling for unknown keys in `preset` and `controls` objects.
  - Preserved generate response contract for UI consumers (`{ ok, data: { draft, generationMeta } }`) while enriching prompt construction only.
  - Added lightweight validation coverage harness in `src/api/internal/content/generate.validation.test.ts` for new strict-validation paths.
  - Updated API boundary documentation for the extended generate request contract and validation semantics.

## task-00103 — SEC — Authz hardening phase 2 follow-through

- Status: **Done**
- Branch: `chore/sec/task-00103-authz-hardening-phase2`
- Scope delivered:
  - Re-verified `/api/internal` app-router surface and confirmed route-level guard coverage remains complete for all current `src/app/api/internal/**/route.ts` handlers.
  - Confirmed no additional low-risk authz gap remained to patch in this phase.
  - Added a docs-backed implementation checklist in `docs/SECURITY_BASELINE.md` for enforcing `requireInternalApiAuth` + `no-store` semantics on all future internal routes.
  - Recorded phase-2 verification outcome and residual follow-up continuity (future upgrade from cookie-presence auth to authoritative session/role auth context).

## task-00102 — UI — Review workbench phase 4

- Status: **Done**
- Branch: `feat/ui/task-00102-review-workbench-phase4`
- Scope delivered:
  - Added a compact **Review Workbench** section in Create (`src/ui/editor-shell.tsx`) that surfaces current selected finding context plus current-session remediation apply history.
  - Extended compliance panel/editor wiring (`src/ui/compliance-panel.tsx` → `src/ui/editor-shell.tsx`) so selected finding context is shared without changing compliance execution behavior.
  - Added low-friction styling updates in `src/app/globals.css` using existing `rf-*` patterns.
  - Preserved generation/save/compliance behavior and request/response contracts.

## task-00100 — SEC — API authz hardening phase 1 for /api/internal

- Status: **Done**
- Branch: `chore/sec/task-00100-api-authz-hardening-phase1`
- Scope delivered:
  - Audited `/api/internal/content/*`, `/api/internal/compliance/check`, and `/api/internal/configure/policy` route handlers for server-authoritative authz assumptions.
  - Added shared internal API auth guard (`requireInternalApiAuth`) that enforces cookie-backed auth checks at route boundary and fails closed with `401`.
  - Applied auth guard to content/compliance/configure internal endpoints and standardized `Cache-Control: no-store` headers on success/error responses.
  - Preserved safe error payloads (`Unauthorized`, validation errors, blocked metadata) without secret/body echoing.

## task-00098 — DEV — Content tools phase 3

- Status: **Done**
- Branch: `feat/dev/task-00098-content-tools-phase3`
- Scope delivered:
  - Added structured generation presets to `internalContentGenerate` with strict validation for supported `tone` and `intent` enums.
  - Added sane defaults for omitted preset input (`tone: professional`, `intent: educate`) while preserving existing template behavior.
  - Extended generation prompt construction with preset-derived guidance without changing UI response shape (`{ ok, data: { draft, generationMeta } }`).
  - Updated generate route typing and API boundary docs for preset request contract + validation behavior.

## task-00097 — SEC — Security hardening sweep phase 1

- Status: **Done**
- Branch: `chore/sec/task-00097-hardening-sweep1`
- Scope delivered:
  - Audited newly touched Create/review flows for authorization boundaries, input bounds, and fail-closed behavior (`/api/internal/content/generate`, `/api/internal/compliance/check`, draft/list/read paths, and Create UI integrations).
  - Added low-risk server-side input bounds and reject-by-default validation in compliance and generation paths:
    - `POST /api/internal/compliance/check`: max content length, content-type allowlist enforcement, policy-set length cap.
    - `internalContentGenerate`: max prompt length with structured validation failure contract.
  - Updated security baseline with a concise hardening checklist, findings, and residual follow-ups for route-level authz and sensitive endpoint cache semantics.
  - Marked docs/task ledger completion for task-00097.

## task-00099 — UI — Review tools UX phase 3

- Status: **Done**
- Branch: `feat/ui/task-00099-review-tools-ux-phase3`
- Scope delivered:
  - Improved remediation usability in `src/ui/editor-shell.tsx` with an explicit **Applied Remediation Context** preview showing before/after remediation block context.
  - Strengthened selected-finding flow in `src/ui/compliance-panel.tsx` by keeping selection actions centralized, persistent, and low-friction with disabled-until-selected controls.
  - Refined review-tool styling in `src/app/globals.css` using existing `rf-*` conventions, including stronger selected-action panel prominence and remediation context preview styling.
  - Preserved existing generation, save, and compliance request/response behaviors and disclaimer/status messaging (no API contract changes).

## task-00096 — UI — Review tools UX phase 2

- Status: **Done**
- Branch: `feat/ui/task-00096-review-tools-ux-phase2`
- Scope delivered:
  - Improved Create review workflow summary with severity chips for faster per-severity scan.
  - Added a dedicated selected-finding action panel in `src/ui/compliance-panel.tsx` with clearer context + centralized `Apply Selected` / `Remind Later` controls.
  - Kept finding card selection and selected-state highlight while simplifying card-level actions to explicit selection.
  - Preserved existing generation/save/compliance request/response behavior and disclaimer/status messaging.
  - Updated supporting styles in `src/app/globals.css` using existing railfin `rf-*` class conventions.

## task-00094 — DEV/UI — Review tools actions phase 1

- Status: **Done**
- Branch: `feat/dev/task-00094-review-tools-actions-phase1`
- Scope delivered:
  - Added finding-level selection flow in `src/ui/compliance-panel.tsx` via `Select Hint` with selected-card state.
  - Gated remediation actions so `Apply Selected` / `Remind Later` execute only for an explicit selected finding.
  - Updated Create flow remediation apply behavior in `src/ui/editor-shell.tsx` to inject a controlled, replaceable remediation draft-context block (instead of unbounded append-only hints).
  - Preserved existing save/generate/compliance request behavior and status/disclaimer messaging.
  - Kept API contracts unchanged (UI-only enhancement, no endpoint/request-response shape changes).
  - Added selected-card styling in `src/app/globals.css` consistent with existing railfin findings-card patterns.

## task-00093 — UI/DEV — Review tools kickoff on Create compliance flow

- Status: **Done**
- Branch: `feat/ui/task-00093-review-tools-kickoff`
- Scope delivered:
  - Added findings summary layer to compliance results with clear severity counts (critical/high/medium/low/unknown + total).
  - Added per-finding review quick actions (`Apply Hint`, `Remind Later`) to improve remediation workflow affordance.
  - Wired Create flow to handle quick actions without changing any API request/response contracts.
  - Preserved existing compliance disclaimer and guardrail messaging, plus existing save/generate/compliance execution paths.
  - Updated styling with railfin-consistent classes (`rf-status`, findings cards, severity badges) and no shell/layout redesign.

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

## task-00059 — SEC — Final GO/NO-GO recheck after task-00058 landed on main

- Status: **Done**
- Branch: `chore/sec/task-00059-final-go-recheck`
- Scope delivered:
  - Re-evaluated launch GO/NO-GO against latest `main` (`b7b9097`) from canonical path `/home/node/railfin`.
  - Confirmed task-00058 runtime behavior now hard-requires Supabase env (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) and table access (`public.drafts`) with explicit BLOCKED diagnostics when missing.
  - Recorded final security baseline decision and residual launch prerequisites in `docs/SECURITY_BASELINE.md`.

## task-00061 — SEC — Go/No-Go policy update using evidence model

- Status: **Done**
- Branch: `chore/sec/task-00061-go-nogo-evidence-model`
- Scope delivered:
  - Updated security baseline with deterministic launch decision model tied to `docs/LAUNCH_EVIDENCE.md`.
  - Defined explicit GO condition (all evidence verified) and NO-GO condition (any critical evidence unverified).
  - Added explicit incident owner/escalation placeholders (owner name/contact + backup name/contact).
  - Added canonical launch evidence ledger template at `docs/LAUNCH_EVIDENCE.md`.

## task-00060 — DEV — Launch-readiness evidence capture (runtime/env/db)

- Status: **Done**
- Branch: `chore/dev/task-00060-launch-evidence-capture`
- Scope delivered:
  - Added `docs/LAUNCH_EVIDENCE.md` with concrete launch-evidence checklist fields for deployment/runtime verification.
  - Captured current local verification status and explicitly marked non-local proof items as **PENDING** (not blocked).
  - Added a compact operator checklist section for fast fill-in by release operator (Rolly).
  - Documented exact proof sources required to close each pending evidence item.

## task-00063 — UI — Library page implementation (from placeholder to usable)

- Status: **Done**
- Branch: `feat/ui/task-00063-library-page-usable`
- Scope delivered:
  - Replaced `/app/library` placeholder with a usable library page that fetches and renders draft rows.
  - Added search input and list filtering via internal list endpoint query parameter (`q`).
  - Added explicit loading, empty, and error states for resilient UX.
  - Wired internal list endpoint route contract (`GET /api/internal/content/list`) for UI consumption.
  - Updated UI/API docs with the new library UX and endpoint behavior.

## task-00065 — UI — Configure page usable baseline

- Status: **Done**
- Branch: `feat/ui/task-00065-configure-page-usable`
- Scope delivered:
  - Replaced `/app/configure` placeholder with a usable Configure screen in `src/ui/configure-page.tsx`.
  - Added free-text policy guidance input area with controlled state.
  - Added provider status placeholders for Codex primary + fallback provider.
  - Added Save/Cancel UX states with dirty-state disable rules and user feedback messaging.
  - Updated UI foundations docs with Configure UX behavior and styling notes.

## task-00066 — DEV — Configure policy endpoint contract (internal)

- Status: **Done**
- Branch: `feat/dev/task-00066-configure-policy-contract`
- Scope delivered:
  - Added internal configure policy endpoint route scaffold at `GET/POST /api/internal/configure/policy`.
  - Added stable, UI-friendly response shape with `ok`, `data`, and validation-friendly `fieldErrors` support.
  - Added safe placeholder persistence mode (`placeholder-memory`) with explicit TODO note for persistent backend follow-up.
  - Updated API boundary documentation with endpoint contract, success/error payloads, and blocked-mode shape.

## task-00067 — SEC — Final launch-go recheck against latest main commit

- Status: **Done**
- Branch: `chore/sec/task-00067-final-go-recheck-after-5a90d76`
- Scope delivered:
  - Re-ran deterministic launch GO/NO-GO model from `docs/SECURITY_BASELINE.md` + `docs/LAUNCH_EVIDENCE.md` against latest `main` baseline commit `5a90d76` from canonical path `/home/node/railfin`.
  - Confirmed final decision remains **NO-GO** because required launch evidence fields are still unverified in `docs/LAUNCH_EVIDENCE.md`.
  - Reduced residual blockers to only missing evidence inputs (no duplicate blocker classes).
  - Updated `docs/SECURITY_BASELINE.md` with concise final verdict and remaining required evidence inputs.

## task-00069 — UI — Library to Create handoff (open/edit draft flow)

- Status: **Done**
- Branch: `feat/ui/task-00069-library-open-draft-flow`
- Scope delivered:
  - Added draft-level action in Library list to open a saved draft directly in Create via query handoff (`/app/create?draftId=<id>`).
  - Added internal draft read endpoint route `GET /api/internal/content/draft?id=<id>` for Create-side loading.
  - Updated editor flow to consume `draftId`, fetch the draft body, and hydrate editor content without changing existing save/compliance behavior.
  - Updated UI foundations docs with the Library → Create handoff contract.

## task-00068 — DEV — Persist configure policy beyond placeholder memory

- Status: **Done**
- Branch: `feat/dev/task-00068-configure-policy-persistence`
- Scope delivered:
  - Replaced configure policy endpoint placeholder-memory storage with Supabase-backed persistence path (`public.configure_policy`).
  - Added explicit BLOCKED contract when required runtime env or table access is unavailable, including env/sql unblock details.
  - Preserved stable GET/POST response shape used by Configure UI (`ok`, `data`, `error`, `meta`, validation `fieldErrors`).
  - Updated API boundary documentation with final configure policy persistence/runtime requirements.

## task-00070 — SEC — Configure policy persistence + library handoff access check

- Status: **Done**
- Branch: `chore/sec/task-00070-configure-library-access-check`
- Scope delivered:
  - Verified security implications for configure policy persistence route (`GET/POST /api/internal/configure/policy`) including access-control and validation behavior.
  - Verified library→create handoff route risk profile and documented fail-closed expectations for handoff parameters and server-side draft ownership checks.
  - Updated `docs/SECURITY_BASELINE.md` with concise risk checklist, current outcome, and required mitigations before privileged rollout.

## task-00071 — DEV — Fix useSearchParams suspense/build issues and stabilize editor routes

- Status: **Done**
- Branch: `fix/dev/task-00071-suspense-route-stability`
- Scope delivered:
  - Stabilized editor route rendering by ensuring `EditorShell` (which uses `useSearchParams`) is mounted behind React `Suspense` boundaries in both `/app/create` and `/preview/editor` page hosts.
  - Re-validated route behavior for create/preview editor hosts and preserved legacy `/app/editor` redirect compatibility.
  - Verified clean production build from canonical path with `npm run build` after refreshing stale local build artifacts.
  - Updated `docs/PREVIEW_RUNBOOK.md` with explicit Suspense/search-params route note for preview operators.

## task-00073 — SEC — Final production GO gate after 00071/00072

- Status: **Done**
- Branch: `chore/sec/task-00073-final-production-go-gate`
- Scope delivered:
  - Ran deterministic launch decision model from `docs/SECURITY_BASELINE.md` (task-00061 policy) against current `docs/LAUNCH_EVIDENCE.md` state.
  - Re-ran production build verification after route/build/UX integration and captured successful clean build evidence from canonical path `/home/node/railfin`.
  - Issued final gate verdict with only concrete residual evidence gaps.
  - Updated `docs/SECURITY_BASELINE.md` with final production gate decision snippet.

## task-00072 — UI — Configure page + create flow UX integration polish

- Status: **Done**
- Branch: `feat/ui/task-00072-configure-create-ux-integration`
- Scope delivered:
  - Added clear, always-visible draft save status messaging in Create flow (`Draft save status: ...`).
  - Added Configure policy freshness indicator to Create flow via `GET /api/internal/configure/policy` (`Policy last updated: ...` when available).
  - Preserved existing Compliance Panel rendering and Library→Create draft handoff behavior.
  - Updated UI foundations documentation with the Configure→Create integration contract.

## task-00074 — DEV — Connect configure policy to compliance request context

- Status: **Done**
- Branch: `feat/dev/task-00074-policy-to-compliance-context`
- Scope delivered:
  - Updated compliance endpoint (`POST /api/internal/compliance/check`) to resolve the latest saved configure policy text before provider execution.
  - Included latest configure policy guidance in the AI evaluation context path (`Latest configure policy guidance` segment in prompt).
  - Preserved compliance response contract and fallback behavior (`{ ok, findings }` shape unchanged).
  - Updated API boundary documentation for configure-policy→compliance context wiring.

## task-00075 — UI — Surface active policy context in create/compliance UX

- Status: **Done**
- Branch: `feat/ui/task-00075-policy-context-ux`
- Scope delivered:
  - Added concise `Active policy context` indicator in the Create/compliance area based on configure policy metadata already loaded in Create flow.
  - Kept existing compliance-check flow and findings rendering behavior unchanged.
  - Preserved Library→Create draft handoff behavior (`draftId` query hydration) unchanged.
  - Updated `docs/UI_FOUNDATIONS.md` with the active policy context UX contract.

## task-00076 — SEC — Policy-context privacy/safety review

- Status: **Done**
- Branch: `chore/sec/task-00076-policy-context-safety`
- Scope delivered:
  - Reviewed configure policy text handling path (`/api/internal/configure/policy` route + persistence layer) for sensitive-content exposure and logging risk.
  - Added explicit security baseline mitigations for policy text minimization, redaction, caching controls, and diagnostics hygiene.
  - Captured implementation checklist for fail-closed handling of sensitive policy context in docs.

## task-00078 — UI — MVP RC1 visual consistency pass across Create/Library/Configure

- Status: **Done**
- Branch: `feat/ui/task-00078-mvp-rc1-visual-consistency`
- Scope delivered:
  - Applied a light consistency pass for page headers across Create, Library, and Configure using shared `rf-page-*` heading styles.
  - Standardized status/feedback presentation using shared `rf-status` variants (`muted`, `success`, `error`) in Create, Library, and Configure views.
  - Kept existing functionality intact for draft handoff/loading, configure policy save/cancel flows, and compliance interactions.
  - Updated UI foundations with RC1 consistency notes and explicit scope constraints.

## task-00077 — DEV — MVP RC1 endpoint stabilization + acceptance checklist wiring

- Status: **Done**
- Branch: `feat/dev/task-00077-mvp-rc1-stabilization`
- Scope delivered:
  - Verified endpoint contracts used by login/create/library/configure/compliance against current route handlers and UI consumers.
  - Added unified RC1 endpoint acceptance section in `docs/MVP_RC1_CHECKLIST.md` with concrete pass criteria and command/check references.
  - Confirmed canonical workspace path for operator execution is `/home/node/railfin`.
  - Kept implementation docs-focused and contract-alignment-first (no behavior-changing code-path edits required).

## task-00079 — SEC — MVP RC1 final gate template + residual risks register

- Status: **Done**
- Branch: `chore/sec/task-00079-mvp-rc1-gate-template`
- Scope delivered:
  - Added RC1 final security gate template in `docs/SECURITY_BASELINE.md`, explicitly tied to `docs/LAUNCH_EVIDENCE.md`.
  - Added ACK policy v1 section for release acknowledgment and approval accountability.
  - Added residual-risk register document at `docs/MVP_RISK_REGISTER.md` with owners, evidence links, and mitigation/acceptance status.
  - Included COO handoff payload template for launch-operator transfer at RC1 gate time.

## task-00080 — DEV — Sensitive internal route hardening (cache + validation)

- Status: **Done**
- Branch: `feat/dev/task-00080-sensitive-route-hardening`
- Scope delivered:
  - Added explicit `Cache-Control: no-store` headers on sensitive internal responses for configure policy and content draft route handlers.
  - Added conservative `policyText` max-length validation (`CONFIGURE_POLICY_MAX_LENGTH = 8000`) with `400` + `fieldErrors` contract.
  - Added fail-closed UUID validation for draft handoff `id` in draft read path before DB access.
  - Added `POST /api/internal/content/draft` route handler wiring while preserving stable `{ ok, data, error, fieldErrors }` contracts.
  - Updated API/security docs to capture controls and behavior.

## task-00081 — DEV — Production draft persistence fix/verify (diagnostics + operator evidence)

- Status: **Done**
- Branch: `feat/dev/task-00081-prod-draft-persistence-verify`
- Scope delivered:
  - Diagnosed primary persistence break: draft-create IDs were non-UUID while draft-read route now fail-closed validates UUID, causing create→read/open flow mismatch.
  - Updated Supabase draft writer to emit UUID ids (`crypto.randomUUID`) so POST-created ids satisfy GET validation contract.
  - Improved blocked diagnostics for draft table operations by surfacing safe root-cause hints (missing table vs permission vs code) without exposing secrets.
  - Expanded `docs/LAUNCH_EVIDENCE.md` with operator-ready production proof runbook and explicit evidence package checklist for URL/SHA/timestamp + POST/GET + table proof.
  - Verified local runtime env evidence remains unavailable in this workspace context (no `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set here), so production verification remains operator-blocked.

## task-00082 — DEV/UI — Rewire Create Save Draft to internal draft API

- Status: **Done**
- Branch: `feat/dev/task-00082-save-draft-api-rewire`
- Scope delivered:
  - Replaced mocked Create save behavior in `src/ui/editor-shell.tsx` (timeout/local success) with real `POST /api/internal/content/draft` request.
  - Preserved existing save UX semantics (saving/saved/error status copy and save-button disable behavior).
  - Added robust save response parsing with meaningful error extraction (`fieldErrors`/`error`) and success feedback that includes draft title/id hints when returned.
  - Kept existing draft load via `draftId` and configure-policy metadata context behavior unchanged.
  - Updated UI foundations docs to reflect restored API wiring for Save Draft.

## task-00083 — SEC — Launch evidence closeout + GO/NO-GO rerun

- Status: **Done**
- Branch: `chore/sec/task-00083-launch-evidence-closeout`
- Scope delivered:
  - Updated `docs/LAUNCH_EVIDENCE.md` with tonight’s verified production evidence (Vercel deploy progression, production draft write `200/ok:true`, and `public.drafts` row proof) and captured the known Vercel protection `401` constraint for unauthenticated curl.
  - Added explicit remaining evidence gaps with concrete operator steps: production draft read proof and AI provider primary/fallback runtime proof (plus env-var presence artifact capture).
  - Re-ran deterministic launch policy gate in `docs/SECURITY_BASELINE.md` and recorded current decision as **NO-GO (BLOCKED)** due only to remaining evidence completeness.
  - Kept changes docs-only; no runtime code modified.
  - Build validation not rerun for this task because scope is documentation-only and does not touch build/runtime surfaces.

## task-00084 — SEC/DEV — Final launch evidence completion + deterministic gate rerun

- Status: **Done**
- Branch: `chore/sec/task-00084-final-evidence-gate`
- Scope delivered:
  - Confirmed task-00083 docs closeout commit is still not contained in `main`; prepared it for merge via local `main` merge path.
  - Expanded `docs/LAUNCH_EVIDENCE.md` with explicit operator placeholders for remaining evidence: production env vars, draft read proof, and AI primary/fallback runtime proofs.
  - Added concise fast-runbook steps for collecting production draft read-proof and AI-proof artifacts quickly from an authenticated prod session.
  - Re-ran deterministic gate in `docs/SECURITY_BASELINE.md` and recorded decision as **NO-GO (BLOCKED)** with exact remaining blockers.
  - Kept task scope docs-only and clearly marked unknown evidence as open (no fabrication).

## task-00085 — DEV/SEC — AI compliance path decision + MVP gate semantics alignment

- Status: **Done**
- Branch: `chore/dev/task-00085-ai-compliance-decision-plan`
- Scope delivered:
  - Inspected live AI compliance execution path and provider/fallback wiring in `src/app/api/internal/compliance/check/route.ts` plus provider modules.
  - Documented current runtime reality vs placeholder artifact (`src/api/internal/compliance/check.ts` is legacy/non-route path).
  - Added option-based decision record (Option A vs Option B) and recommended Option B for MVP based on effort/risk/time.
  - Updated launch-evidence semantics so AI primary/fallback runtime proof is explicitly deferred from MVP-critical gating.
  - Updated security baseline decision log and rationale to align launch gate policy with current MVP scope and evidence posture.

## task-00086 — DEV/UI — Wire Create compliance request payload to contract

- Status: **Done**
- Branch: `feat/dev/task-00086-compliance-request-wireup`
- Scope delivered:
  - Updated `src/ui/compliance-panel.tsx` to send the required `content` field to `POST /api/internal/compliance/check` and include optional `contentType`/`policySet` when present.
  - Wired `src/ui/editor-shell.tsx` to pass editor context into the compliance panel (`content`, baseline `contentType`, baseline `policySet`).
  - Preserved existing compliance UX states (loading, error, findings rendering/grouping) while preventing empty-content runs.
  - Updated compliance request contract notes in `docs/API_BOUNDARY.md` and UI behavior notes in `docs/UI_FOUNDATIONS.md`.

## task-00087 — DEV/SEC — AI single-key dual-service contract unification

- Status: **Done**
- Branch: `chore/dev/task-00087-ai-service-contract-unification`
- Scope delivered:
  - Recorded architecture decision: one shared AI key/config path with two independent service contracts (Generate vs Compliance).
  - Updated `docs/API_BOUNDARY.md` with explicit dual-service separation rules, shared env path notes, and provider primary/fallback behavior across both services.
  - Updated `docs/SECURITY_BASELINE.md` with safety-boundary requirements for contract/prompt/schema separation.
  - Added minimal follow-up implementation checklist for Generate/Compliance contract hardening and failover tests.
  - Captured merge guidance context for task-00086 commit `945b712` in task handoff/reporting.

## task-00088 — DEV — Merge task-00086 + task-00087 into main

- Status: **Done**
- Branch: `task-00088-merge`
- Scope delivered:
  - Created isolated merge worktree from `origin/main` and cherry-picked task-00086 (`945b712`) and task-00087 (`0674319`).
  - Resolved conflicts in `src/ui/compliance-panel.tsx` and docs files while preserving compliance request payload wiring (`content`, optional `contentType`/`policySet`) and task-00087 AI contract/security documentation updates.
  - Reconciled `docs/tasks.md` ledger so task entries 00086, 00087, and 00088 are coherent and marked done.
  - Ran `npm run build` in the merge worktree and confirmed success before publishing.
  - Pushed merged result to `origin/main`.

## task-00089 — SEC/COO — MVP gate closeout checklist + deterministic unblock sync

- Status: **Done**
- Branch: `chore/sec/task-00089-mvp-gate-closeout`
- Scope delivered:
  - Reconciled launch-gate document state on latest `main` for `docs/LAUNCH_EVIDENCE.md`, `docs/SECURITY_BASELINE.md`, and `docs/tasks.md`.
  - Added one-pass, operator-executable evidence checklist with explicit artifact payload format requirements for production env proof and draft read proof.
  - Aligned AI runtime proof semantics to current policy (task-00085 Option B): deferred from MVP-critical gate with explicit deferral recording fields.
  - Recorded deterministic decision status and exact unblock conditions required to flip MVP gate from NO-GO to GO.
  - Kept changes docs-only; no runtime/code-path refactor performed.

## task-00090 — SEC — Final MVP gate rerun using production evidence

- Status: **Done**
- Branch: `chore/sec/task-00090-final-gate-rerun`
- Scope delivered:
  - Updated `docs/LAUNCH_EVIDENCE.md` to mark production env-vars evidence and draft create/read + DB-row evidence as verified.
  - Re-ran deterministic launch gate in `docs/SECURITY_BASELINE.md` under task-00085 Option B semantics and recorded final **GO** decision for MVP-critical criteria.
  - Documented non-blocking follow-up that AI runtime primary/fallback evidence remains post-MVP hardening work.
  - Kept changes docs-only with no runtime/code-path modifications.

## task-00091 — DEV — AI runtime hardening phase 1

- Status: **Done**
- Branch: `feat/dev/task-00091-ai-runtime-hardening-phase1`
- Scope delivered:
  - Added shared deterministic provider-chain runtime for both content generation and compliance service paths.
  - Hardened provider error handling to avoid upstream body echo/leakage and classify failures into safe diagnostics kinds.
  - Wired compliance and content-generate paths through the shared chain with service-specific parsing/fallback behavior preserved.
  - Added `POST /api/internal/content/generate` app route and kept output contract stable with additive diagnostics metadata.
  - Updated boundary/security docs for provider-chain behavior and runtime diagnostics.

## task-00092 — DEV/UI — Content tools kickoff on hardened AI runtime

- Status: **Done**
- Branch: `feat/dev/task-00092-content-tools-kickoff`
- Scope delivered:
  - Hardened `POST /api/internal/content/generate` with strict request/response validation and safe degraded fallback behavior.
  - Wired Create UI generation flow to call `/api/internal/content/generate` with content-type selection and in-editor hydration of generated text.
  - Preserved existing save-draft and compliance-check flows, including compliance legal-guardrail language.
  - Added deterministic provider-chain coverage tests for primary success, fallback success, and full-failure degraded diagnostics.
  - Updated API/UI/task documentation for the new generation capability and coverage.

## task-00095 — DEV — Content tools phase 2

- Status: **Done**
- Branch: `feat/dev/task-00095-content-tools-phase2`
- Scope delivered:
  - Added template-aware generation controls in internal generate path with strict template validation.
  - Introduced two generation templates (`default`, `conversion`) with explicit prompt guidance injection.
  - Preserved existing UI response contract (`{ ok, data: { draft, generationMeta } }`) and fallback behavior.
  - Updated API boundary docs for optional template input and validation semantics.

## task-00140 — DEV — align UI package flow with package-mode API contract

- Status: **Done**
- Branch: `feat/dev/task-00140-package-ux-api-alignment`
- Scope delivered:
  - Updated Create package generation path to call a single canonical package request (`mode: "package"`, `package.assets`) instead of fan-out single-mode calls.
  - Preserved single-draft behavior and contract compatibility (`mode: "single"` + `contentType`) for existing flows.
  - Added UI-side package response normalization/validation to fail closed when package assets are missing or malformed.
  - Updated API boundary/task/changelog docs and re-ran `npm run build` (pass).

## task-00143 — UI/COO — Events nav placeholder + PRD capture

- Status: **Done**
- Branch: `feat/ui/task-00143-events-nav-prd`
- Scope delivered:
  - Added `Events` item to primary app navigation (`/app/events`).
  - Added Events placeholder page and shortcut redirect route.
  - Authored `docs/PRD_Events_Module_v0.md` with human-readable module scope for event creation, content generation, registration, QR check-in, and attendance-based post-event communication.
  - Updated changelog with Events kickoff entry.
