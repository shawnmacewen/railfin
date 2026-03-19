# Railfin — Product Requirements Document (PRD)

- **Version:** v1.2 (Execution-updated)
- **Owner:** Rolly (Product)
- **COO/Orchestration:** railfin-coo
- **Contributors:** railfin-dev, railfin-ui, railfin-sec
- **Status:** Draft Ready for Execution Planning
- **Last Updated:** 2026-02-28 (UTC, execution update)

---

## 1) Product Summary
Railfin MVP is an AI-powered content creation platform for financial advisors with in-flow compliance feedback. Users create marketing and educational content with AI, then run a compliance scan (button-triggered in MVP) to get potential FINRA/SEC violation feedback before submitting for formal compliance review.

## 2) MVP “Wow” Outcome
A user can:
1. Generate content using AI (articles, social posts, emails, newsletters, videos, whitepapers/educational material).
2. Trigger compliance analysis from the creation screen.
3. See actionable violation feedback before submission.
4. Rapidly generate campaign-level content plans/calendar drafts based on advisor inputs (topics/questions/themes).

This combines speed (AI drafting) + safety (compliance feedback) + organization (campaign planning/calendar).

## 3) Problem Statement
Financial advisors need to produce high-quality marketing content quickly, but compliance review cycles are slow and risky when issues are found late. Existing workflows separate creation from compliance, causing rework and delays.

Railfin addresses this by integrating compliance feedback directly into creation workflows.

## 4) Goals (MVP)
1. Ship AI-assisted creation workflows for core content types.
2. Provide button-triggered compliance scans against FINRA/SEC-oriented rules.
3. Surface clear, contextual guidance on potential violations.
4. Support quick campaign/calendar generation from advisor themes/questions.
5. Enforce lane-based delivery with documentation and merge hygiene.

## 5) Non-Goals (MVP)
- Full autonomous campaign orchestration without user confirmation.
- Advanced policy engine customization depth (beyond initial user-policy input support).
- Enterprise-grade compliance automation claims.

## 6) Users & Stakeholders
- **Primary user:** Financial advisor/marketer creating regulated content.
- **Decision maker:** Rolly.
- **Execution lanes:**
  - railfin-dev (backend/core logic/integrations)
  - railfin-ui (authoring UX, feedback surfaces, campaign calendar UX)
  - railfin-sec (auth, data safety, abuse/risk controls)
- **Coordinator:** railfin-coo.

## 7) Target Timeline
- **Target:** ~1 month from now (flexible, no hard external deadline).
- **Operating assumption:** prioritize learning speed and MVP proof over rigid date enforcement.

## 8) Functional Scope (MVP)
### 8.1 AI Content Creation
- Prompt-driven generation for:
  - Articles
  - Social posts
  - Emails
  - Newsletters
  - Video concepts/scripts
  - Educational content (e.g., whitepapers)

### 8.2 Compliance Feedback (Button-triggered)
- “Run Compliance Check” action from creator UI.
- Rule-evaluation pass aligned to FINRA/SEC guidance + app-provided policy set.
- User-facing output:
  - Potential issue type
  - Flagged text/span
  - Why it may violate
  - Suggested remediation direction

### 8.3 Custom Policy Input (Initial)
- User can add organization/head-office policy notes/rules for additional checks.
- System merges baseline checks + user policy checks in feedback.

### 8.4 Campaign/Calendar Drafting
- Generate campaign drafts and sequenced content ideas from advisor themes/questions.
- Present as editable plan in calendar-like organization view.
- **Current execution note:** campaign/calendar work is intentionally parked in backlog for now; focus is on shipping stable auth + persistence + AI-backed compliance quality first.

## 9) Security & Compliance Constraints (MVP)
1. Must-have authentication for app login (baseline secure auth flow).
2. Protect user content and policy inputs with appropriate access controls.
3. Preserve auditable compliance-check output for user trust/debugging.
4. Avoid overstating legal/compliance certainty; present as risk guidance.

## 10) Architecture Direction (Decision Locked for MVP)
**Selected MVP stack:**
- **Web:** Next.js + Tailwind
- **DB/Auth:** Supabase (Postgres + Auth + Storage)
- **Backend pattern:** modular monolith in Next.js initially

**API design (from day one):**
- `/api/internal/*` for app frontend/BFF usage
- `/api/v1/*` for external client integrations (limited scope for MVP)

**Scale plan:**
- Extract `/api/v1/*` into a dedicated Node service when external API usage, release cadence, or security isolation needs justify separation.

## 11) Delivery Operating Model (COO Rules)
- Intake all work via railfin-coo.
- Single-lane ownership per task.
- Branch-per-task and refs required (branch/PR/commit).
- Merge sequencing based on dependency/conflict risk.
- QA/review checkpoint before main merge.
- Weekly updates default; daily updates during high-risk/high-change windows.

## 12) Risks & Mitigations
- **Regulatory interpretation risk:** compliance checks may be incomplete.
  - *Mitigation:* clear “guidance, not legal approval” language + incremental ruleset hardening.
- **False positives/negatives in checks:**
  - *Mitigation:* explainability and user-edit loops.
- **Merge conflicts across lanes:**
  - *Mitigation:* bounded lane ownership + sequence control.
- **Scope growth into full campaign automation too early:**
  - *Mitigation:* gate advanced automation post-MVP.

## 13) Milestones (Draft)
- **M0 (Week 1):** Product skeleton, auth baseline, content editor scaffold.
- **M1 (Week 2):** AI generation for first content types + save/edit flow.
- **M2 (Week 3):** Compliance-check pipeline + UI feedback rendering.
- **M3 (Week 4):** Hosted preview hardening (Vercel), app shell UX baseline, Supabase persistence + AI compliance quality improvements.
- **Backlog milestone (post-MVP):** Campaign/calendar draft generation.

## 14) Open Decisions
1. Compliance rule representation (prompt-based only vs hybrid structured rule layer).
2. External API auth model for `/api/v1/*` (service keys, OAuth, tenant-scoped tokens).
3. First public API module set (which endpoints ship in MVP vs post-MVP).

## 15) Testing Bar (Decision: Level A for MVP)
"Minimum testing bar for merge" = the least evidence required before code can be merged to main.

**Selected for MVP:** **Level A (Fast MVP)**
- Lint/typecheck pass
- Basic manual test notes in PR
- Smoke test for changed flow

**Planned post-MVP evolution:**
- Move to Level B for core logic and security-sensitive areas.
- Keep Level A available for low-risk UI polish when appropriate.

---

## Appendix A — Weekly Update Template
- Shipped this week
- In progress
- Blockers/risks
- Security/compliance notes
- Next week priorities
- Decisions needed from Rolly

## Appendix B — Daily Update Template (When Active)
- Today shipped
- Current blockers
- At-risk (24–72h)
- Next actions by lane (dev/ui/sec)

## Auth + Tenant Segmentation (phase-1, task-00225)

### Decision
- Railfin uses Supabase Auth user identity as the server-authoritative principal for protected internal APIs.
- Tenant model in phase-1 is **single-org-per-user**:
  - `tenantId = user.app_metadata.tenant_id` when present
  - otherwise `tenantId = user.id`

### Data isolation baseline
- Core persisted entities in phase-1 include ownership columns:
  - `owner_id` (required)
  - `tenant_id` (required)
- API read/write paths MUST scope by both keys.

### Backward compatibility
- Temporary compat mode (`INTERNAL_API_AUTH_COMPAT_MODE`) allows same-origin session-cookie fallback with legacy scope defaults while UI/session migration is completed.
- Goal for next phase: disable compat mode and require Supabase JWT for all protected internal operations.

### Operational migration
- Manual idempotent migration script: `docs/auth_segmentation_phase1.sql`
- Deterministic backfill defaults: `legacy-owner`, `legacy-tenant`
- Rollback guidance included in script comments.

## Auth & Segmentation — Phase 1 (task-00225)

### Scope lock
- Identity source: Supabase Auth user id.
- Segmentation: user-owned data (`owner_user_id`) only.
- Org/tenant tables: deferred; not in phase-1.
- Soft delete policy: `deleted_at` on user-owned tables.

### Data model baseline
- User-owned entities carry:
  - `owner_user_id uuid not null`
  - `deleted_at timestamptz null`
- Enrollment hardening includes uniqueness on `(owner_user_id, campaign_id, contact_id)`.
- IDs are UUID-safe in v1 migration path.

### API guardrails
- Internal API reads/writes are scoped by authenticated owner id.
- Default list/read operations exclude soft-deleted rows.
- Validation remains strict/fail-closed with safe operator errors.
