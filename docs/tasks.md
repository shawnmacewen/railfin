## task-00224 — UI — Fix Create compliance toggle regression (collapsed state visibility mismatch)

- Status: **Done**
- Branch: `fix/ui/task-00224-create-compliance-toggle-regression-fix`
- Scope delivered:
  - Fixed Create compliance toggle state wiring so button label/`aria-expanded` and rendered panel visibility are derived from one shared flag (`isComplianceExpanded`).
  - Kept a single stable compliance toggle control location in the existing top toggle row.
  - Kept default initial state collapsed on first load.
  - Ensured collapse targets the compliance body container directly and enforces hidden state with explicit CSS guard (`.rf-create-compliance-card[hidden] { display: none !important; }`).
  - Preserved compliance findings/results cache continuity by keeping `CompliancePanel` mounted and only toggling container visibility.
  - Added lightweight deterministic regression guard in `EditorShell` (dev warning if collapsed state and body hidden state diverge).
  - Updated docs and verified with `npm run build` (pass).

## task-00223 — UI — Create compliance default collapsed + header copy removal

- Status: **Done**
- Branch: `fix/ui/task-00223-create-compliance-default-and-header-copy`
- Scope delivered:
  - Kept Create compliance rail defaulted to **collapsed/minimized** on first load (no expanded-default regression).
  - Removed the top compliance panel header title text (`Compliance Feedback`) from the compliance card.
  - Preserved the single stable top toggle control behavior from task-00222 (`⇤ Open Compliance` / `⇥ Minimize Compliance`).
  - Preserved compliance results caching while toggling by keeping the compliance card mounted and only hidden when collapsed.
  - Preserved responsive no-overlap behavior for collapsed and expanded layouts.
  - Updated docs and verified with `npm run build` (pass).

## task-00222 — UI — Create compliance toggle stabilization

- Status: **Done**
- Branch: `fix/ui/task-00222-create-compliance-toggle-button-fix`
- Scope delivered:
  - Kept Create compliance rail defaulted to **collapsed/minimized** on initial load.
  - Replaced split open/minimize controls with a single stable toggle button in one consistent top-right location of the compliance rail.
  - Toggle now flips label/state cleanly: `⇤ Open Compliance` / `⇥ Minimize Compliance`.
  - Removed prior minimized wrapper/control path that caused right-side visual artifact.
  - Preserved compliance panel mount/hidden behavior so cached findings/results continue to persist while minimized.
  - Preserved responsive behavior and no-overlap layout in collapsed mode.
  - Updated docs and verified with `npm run build` (pass).

## task-00221 — UI — Configure nav version label

- Status: **Done**
- Branch: `feat/ui/task-00221-nav-config-version-label`
- Scope delivered:
  - Added a subtle app version label directly beneath the **Configure** nav item in the left sidebar.
  - Wired version source from `package.json` via app layout prop into `AppShell` (no hardcoded version string).
  - Kept nav icon sizes/row spacing/auto-collapse behavior stable by adding a lightweight secondary label style and matching collapsed label-hide transition behavior.
  - Preserved responsive shell behavior for mobile/off-canvas navigation.
  - Updated docs and verified with `npm run build` (pass).

## task-0034 — UI — CRM search left align

- Status: **Done**
- Branch: `feat/ui/task-0034-crm-search-left-align`
- Scope delivered:
  - Moved CRM top search field to the left side of the toolbar container.
  - Kept contact count badge and **Add Contact** button intact on the action side.
  - No behavior or API changes.
  - Updated docs and verified with `npm run build` (pass).

## task-0032 — UI — Events actions style pass (CRM parity)

- Status: **Done**
- Branch: `feat/ui/task-0032-events-actions-style-pass`
- Scope delivered:
  - Normalized Events action-row spacing/class usage to CRM action-row pattern.
  - Applied shared button styling for action-row buttons so Events Edit/Delete visually match CRM action controls.
  - No behavior or API contract changes.
  - Updated docs and verified with `npm run build` (pass).

## task-00228 — UI — CRM contacts mutations UI (Add/Edit/Delete)

- Status: **Done**
- Branch: `feat/ui/task-00228-crm-contacts-mutations-ui`
- Scope delivered:
  - Renamed CRM primary action button from **Add New Lead** to **Add Contact**.
  - Added Edit actions in table and card views with shared modal/form flow and prefilled contact values.
  - Added Delete actions in table and card views with explicit confirmation UI.
  - Preserved responsive table/card behavior and existing create flow semantics.
  - Updated docs and verified with `npm run build` (pass).

## task-00225 — UI — Tiny configure smoke change

- Status: **Done**
- Branch: `feat/ui/task-00225-ui-smoke-change`
- Scope delivered:
  - Added subtle non-functional footer note on Configure page: `System status: operational`.
  - No contract/behavior changes; layout remains stable.
  - Updated docs (`tasks`, `CHANGELOG`, `agent-reports/railfin-ui`).
  - Build verification attempted in lane worktree; blocked by environment permission issue (`next: Permission denied`).

## task-00219 — UI — Campaign automation template packs (event-focused)

- Status: **Done**
- Branch: `feat/ui/task-00219-campaign-automation-templates-ui`
- Scope delivered:
  - Added event-focused template pack selector in Campaign create flow with three starter packs:
    - Pre-event nurture
    - Registrant reminders (T-7 / T-1 / T-1h scaffold)
    - Post-event follow-up
  - Added template preview summary card prior to apply (pack description + sequence/step counts).
  - Added **Apply template** action that scaffolds sequence + step drafts directly into the existing campaign builder for immediate user edits.
  - Added overwrite safety: if builder contains non-default draft content, apply requires explicit confirmation (no silent replacement).
  - Added apply progress/error UX states (`Applying template...` + safe fallback error message).
  - Added responsive additive styles for template pack + preview blocks in `src/app/globals.css`.
  - Updated docs (`tasks`, `CHANGELOG`, `UI_FOUNDATIONS`, `agent-reports/railfin-ui`) and verified with `npm run build` (pass).

## task-00220 — SEC — Event→campaign trigger flow security validation

- Status: **Done**
- Branch: `chore/sec/task-00220-events-campaign-trigger-security`
- Scope delivered:
  - Re-validated auth guard + no-store behavior on relevant trigger-adjacent internal endpoints (`/api/internal/events/registrations`, `/api/internal/campaigns/[campaignId]/enrollments`, `/api/internal/campaigns/enrollments/[enrollmentId]/transition`): all enforce `requireInternalApiAuth(request)` and return `INTERNAL_SENSITIVE_NO_STORE_HEADERS`.
  - Verified validation/error posture remains fail-closed and non-reflective (`Validation failed` + bounded `fieldErrors`; no raw payload echo) across reviewed enrollment + registration contracts.
  - Identified duplicate-enrollment guard gap: current enrollment create flow (`internalCampaignEnrollmentsCreate` → `createCampaignEnrollmentInTable`) does not enforce uniqueness for `(campaign_id, contact_id)` and bootstrap SQL currently lacks a unique index/constraint, so malformed or replayed payloads can still create duplicate enrollments if they pass basic schema checks.
  - Documented security caveats and hardening follow-ups (add DB-level unique constraint + app-layer idempotency conflict mapping; tighten auth compat mode retirement path).
  - Build verification: **SKIPPED** (docs-only security validation; no runtime code changes).

## task-00218 — DEV — Event-triggered campaign enrollment hooks

- Status: **Done**
- Branch: `feat/dev/task-00218-events-campaign-enrollment-hooks`
- Scope delivered:
  - Added event-trigger enrollment processor contract in campaigns core and wired event registration submissions to invoke it.
  - Added protected internal endpoint `POST /api/internal/campaigns/triggers/events` for explicit internal trigger ingestion.
  - Added strict trigger payload validation (`eventId`, `contactId|email`, `triggerType`, optional source metadata) with fail-closed safe `fieldErrors`.
  - Added deterministic duplicate guard for `contactId + campaignId + eventId + triggerType` using persisted enrollment trigger events.
  - Persisted trigger context metadata into enrollment event `details_json` for auditability.
  - Preserved existing events registration API behavior while augmenting response with additive `campaignTrigger` result details.
  - Updated docs (`tasks`, `CHANGELOG`, `API_BOUNDARY`, `agent-reports/railfin-dev`) and verified `npm run build` (pass).

## task-00216 — UI — Campaigns calendar + execution visibility UI v1

- Status: **Done**
- Branch: `feat/ui/task-00216-campaigns-calendar-and-execution-ui`
- Scope delivered:
  - Added campaign execution visibility panel with enrollment list rendering (`status`, active sequence/step, last transition timestamp) and explicit unavailable messaging when execution endpoint is not ready.
  - Added start/pause/resume control affordances per enrollment with backend-aware availability handling and safe error feedback when execution controls are unsupported.
  - Upgraded campaign timeline to grouped upcoming activity with date-range filtering (`This week`, `Next 30 days`, `Custom`) and improved loading/empty/error UX states.
  - Added timeline placeholder items from sequence steps (social/email/task-oriented placeholders) so upcoming workflow is visible even before full backend scheduling coverage.
  - Added sequence progression hints in both sequence builder and sequence detail surfaces without removing/editing existing step editing UX from prior tasks.
  - Added responsive stability tweaks to campaigns toolbars/control rows to reduce overlap and improve behavior at narrow widths.
  - Updated docs (`tasks`, `CHANGELOG`, `UI_FOUNDATIONS`, `agent-reports/railfin-ui`) and verified with `npm run build` (pass).

## task-00217 — SEC — Campaigns execution/enrollment endpoints security validation

- Status: **Done**
- Branch: `chore/sec/task-00217-campaigns-execution-security-pass`
- Scope delivered:
  - Reviewed internal campaigns API route surface for execution/enrollment coverage and verified all currently wired campaigns handlers enforce `requireInternalApiAuth(request)` and return `INTERNAL_SENSITIVE_NO_STORE_HEADERS`.
  - Confirmed repository currently has **no shipped campaigns execution/enrollment transition endpoints** (no route handlers for enroll/transition/execute actions found under `src/app/api/internal`), so task scope was validated against currently implemented surface.
  - Re-verified fail-closed validation + safe error posture on campaign write actions (strict allowlist keys, bounded field validation, deterministic `Validation failed` + `fieldErrors` responses).
  - Re-verified no unsafe payload reflection in error responses across campaign contracts (no raw request payload echoing in API error bodies).
  - Added security documentation notes and sec lane report update for traceability.
  - Build verification: **SKIPPED** (docs-only security verification; no runtime code changes).

## task-00212 — UI — Campaigns builder UX polish v2

- Status: **Done**
- Branch: `feat/ui/task-00212-campaigns-builder-ux-polish-v2`
- Scope delivered:
  - Refined Campaign create modal step editor with clearer step grouping/labels for email, wait, and condition step types.
  - Improved condition-step readability with explicit rule-logic wording (`if` all required vs `or` any match), clearer yes/no path fields, and inline helper copy.
  - Tightened social scheduler form layout with clearer date/time guidance and refined status-chip treatment in scheduled/timeline lists.
  - Upgraded targeting preview into a clearer summary card for matched/total counts and sample IDs, with explicit but cleaner not-available states.
  - Applied responsive spacing/layout cleanup across campaigns builder sections for better small-screen behavior.
  - Updated campaign UI styles in `src/app/globals.css` with additive `rf-campaigns-*` helpers.
  - Build verification: `npm run build` (pass).

## task-00213 — SEC — Campaigns + Contacts API security/validation verification

- Status: **Done**
- Branch: `chore/sec/task-00213-campaigns-api-security-validation`
- Scope delivered:
  - Verified auth-guard coverage and `Cache-Control: no-store` behavior across new Campaigns internal routes and Contacts bridge endpoint.
  - Verified fail-closed request validation across Campaigns targeting preview, sequences, steps, social-post create/update, and calendar/list/detail surfaces.
  - Verified validation/error response safety posture: deterministic `Validation failed` + `fieldErrors` mapping with no raw request payload echoing.
  - Documented auth compat-mode caveat and exact remediation path (retire same-origin fallback by setting `INTERNAL_API_AUTH_COMPAT_MODE=off` after authoritative session checks are fully rolled out).
  - Build verification: **SKIPPED** (docs-only security verification; no runtime code changes).

## task-00209 — DEV — Campaigns API engine v1 (sequences/steps/social/calendar/targeting)

- Status: **Done**
- Branch: `feat/dev/task-00209-campaigns-api-engine-v1`
- Scope delivered:
  - Replaced campaigns in-memory persistence with Supabase-backed store helpers in `src/lib/supabase/campaigns.ts` using phase-1 bootstrap tables.
  - Added campaign detail endpoint support and expanded protected internal API surface:
    - `GET /api/internal/campaigns/[campaignId]`
    - `GET/POST /api/internal/campaigns/[campaignId]/sequences`
    - `PATCH /api/internal/campaigns/[campaignId]/sequences/[sequenceId]`
    - `GET/POST /api/internal/campaigns/sequences/[sequenceId]/steps`
    - `PATCH /api/internal/campaigns/sequences/[sequenceId]/steps/[stepId]`
    - `GET/POST /api/internal/campaigns/[campaignId]/social-posts`
    - `PATCH /api/internal/campaigns/[campaignId]/social-posts/[postId]`
    - `GET /api/internal/campaigns/[campaignId]/calendar`
  - Kept existing `GET/POST /api/internal/campaigns` and targeting preview route compatibility for shipped UI flows.
  - Added deterministic targeting preview sample IDs (`sampleContactIds`) plus strict fail-closed field validation semantics.
  - Preserved condition-step contract (`if/or` + rules + yes/no sequence IDs) with validation-heavy safe `fieldErrors` responses.
  - Verified with `npm run build` (pass).

## task-00210 — UI — Campaigns UI builder v1 (sequence editor + social scheduler surface)

- Status: **Done**
- Branch: `feat/ui/task-00210-campaigns-ui-builder-v1`
- Scope delivered:
  - Upgraded `/app/campaigns` from scaffold to usable v1 builder experience.
  - Added campaign create modal sequence builder with:
    - add sequence
    - add step per sequence
    - step forms for `email` (subject/body), `wait` (minutes), and `condition` (`if/or`, JSON rules textarea, yes/no sequence IDs).
  - Added campaign targeting preview UX improvements:
    - loading/error/empty handling
    - matched/total count chips
    - sample ID display sourced from CRM contacts when available.
  - Added social scheduler surface:
    - schedule form (`platform`, `content`, `scheduled_for`)
    - scheduled posts list panel
    - calendar/timeline panel wired to calendar-items endpoint when available.
  - Added explicit graceful unavailable handling for not-yet-shipped APIs (`not available yet`) with no broken UI states.
  - Preserved app shell/nav stability and responsive non-overlap behavior with additive `rf-campaigns-*` styles.
  - Updated docs and lane report; verified with `npm run build` (pass).

## task-00208 — UI — Campaigns UI foundation v1 (from PRD + schema)

- Status: **Done**
- Branch: `feat/ui/task-00208-campaigns-ui-foundation-v1`
- Scope delivered:
  - Replaced Campaigns placeholder with functional phase-1 UI in `/app/campaigns`:
    - campaigns list table (`name`, `status`, `objective`, `created`)
    - Create Campaign action
    - loading, empty, and error states with retry path
  - Added Create Campaign modal flow with required fields (`name`, `objective`, `status`) and targeting stubs:
    - source-segment selector placeholder
    - read-only contacts/lead-stage summary chips (via targeting preview)
  - Wired to internal APIs from task-00207 where available:
    - `GET /api/internal/campaigns`
    - `POST /api/internal/campaigns`
    - `POST /api/internal/campaigns/targeting/preview`
  - Added campaign detail scaffold on-page:
    - sequence cards
    - step placeholders (`email`, `wait`, `condition`)
    - explicit “coming next” marker for branching editor
  - Added scheduled social-post calendar scaffold card (responsive placeholder, no drag/drop)
  - Updated docs and lane report; verified with `npm run build` (pass).

## task-00207 — DEV — Campaigns module phase-1 foundation + PRD update (contacts-first targeting)

- Status: **Done**
- Branch: `feat/dev/task-00207-campaigns-prd-foundation-phase1`
- Scope delivered:
  - Added Campaigns module PRD (`docs/PRD_Campaigns_Module_v0.md`) with MVP/v2 rollout, contacts-first targeting posture, branching rules, and event-trigger roadmap.
  - Added campaigns schema bootstrap SQL (`docs/campaigns_bootstrap.sql`) covering campaigns/sequences/steps/enrollments/social-posts/calendar-items/contacts/segments.
  - Added protected internal API foundation routes:
    - `GET/POST /api/internal/campaigns`
    - `POST /api/internal/campaigns/targeting/preview`
    - `GET /api/internal/crm/contacts`
  - Added fail-closed contracts/validation for campaign sequence+step definitions and targeting preview inputs with safe error payloads.
  - Updated Campaigns page placeholder copy to expose phase-1 foundation entrypoints without breaking existing app flows.
  - Updated API boundary/changelog/dev report docs and verified with `npm run build` (pass).

## task-00206 — UI — Fix Create compliance controls position when panel is minimized

- Status: **Done**
- Branch: `fix/ui/task-00206-compliance-controls-position-collapsed`
- Scope delivered:
  - Fixed collapsed compliance controls placement in Create so the minimized controls remain anchored near the top of the workspace instead of dropping to the bottom.
  - Updated desktop collapsed layout to keep a dedicated narrow compliance-controls column (`minmax(0,1fr) auto`) while expanded state remains unchanged.
  - Updated mobile/tablet collapsed ordering so compliance controls render above main Create content in single-column layouts, preventing bottom-of-page drift.
  - Preserved task-00204 non-overlap behavior by keeping controls in normal layout flow (no floating overlay/absolute overlap on editor inputs).
  - Preserved task-00203 compliance result caching behavior (compliance panel still remains mounted while collapsed).
  - Verified with `npm run build` (pass).

## task-00205 — UI — Create prompt payload debug drawer

- Status: **Done**
- Branch: `feat/ui/task-00205-create-prompt-payload-debug-drawer`
- Scope delivered:
  - Added a compact **View prompt payload** toggle on Create generation controls for operator/debug use.
  - Added a small in-page debug drawer showing the latest captured model prompt payload for this Create session.
  - Drawer includes:
    - exact assembled prompt string sent to the model
    - key request metadata (mode/contentType/template/tone/intent/controls/topics/purposes)
    - **Copy payload** action (clipboard)
  - Extended generate API response with additive debug metadata (`data.debug`) so UI can display exact assembled prompt without affecting normal flows.
  - Preserved generate/compliance/save/history behavior and verified with `npm run build` (pass).

## task-00204 — UI — Create compliance rail overlap + control placement cleanup

- Status: **Done**
- Branch: `fix/ui/task-00204-compliance-rail-overlap-divider-fix`
- Scope delivered:
  - Reworked Create compliance rail controls so minimized state uses an in-flow reopen button (`⇤ Open Compliance`) instead of an absolute/floating toggle that could overlap editor form controls.
  - Moved minimize affordance into the compliance card header and widened it with arrow icon + readable label (`⇥ Minimize Panel`).
  - Removed the middle blue rail/divider treatment by deleting the separate narrow rail control column and using card/header spacing instead.
  - Kept task-00203 compliance cache behavior intact by continuing to keep the compliance card mounted while collapsed (`hidden`), preserving findings/run state until explicit reset/save invalidation.
  - Preserved Create unsaved warning, responsive breakpoints, and compliance run/findings/remediation flows.
  - Verified with `npm run build` (pass).

## task-00203 — UI — Persist Create compliance results locally while panel is minimized

- Status: **Done**
- Branch: `feat/ui/task-00203-create-compliance-results-local-cache`
- Scope delivered:
  - Persisted latest compliance results in Create-session local state so minimizing/reopening the compliance rail no longer clears findings.
  - Kept compliance panel mounted while collapsed (hidden-only), preserving run summary, findings, and selection context on reopen.
  - Added stale-results indicator when editor content/policy context changes after a compliance run: **"Content changed since last check..."** while keeping prior findings visible.
  - Added explicit compliance-result invalidation on successful Save Draft via reset token wiring from `EditorShell` to `CompliancePanel`.
  - Preserved manual run behavior (no auto-rerun on panel toggle), existing run button/findings rendering, and current compliance API contracts.
  - Verified with `npm run build` (pass).

## task-00202 — DEV/UI — Compliance finding location mapping + unknown fallback cleanup

- Status: **Done**
- Branch: `fix/dev/task-00202-compliance-location-mapping-fallback`
- Scope delivered:
  - Upgraded compliance finding location normalization in `POST /api/internal/compliance/check` to extract meaningful labels from either `location` string/object or top-level `source/file/section/line/column` fields.
  - Added stable additive contract field `locationLabel` (nullable) while preserving legacy `location` string for compatibility.
  - Removed `unknown:0:0` fallback rendering from compliance finding cards; location row is now hidden when no meaningful location exists.
  - Updated selected-finding context and remediation-path location fallbacks to use friendly `Location unavailable` text instead of placeholder coordinates.
  - Preserved existing run-check/findings/remediation flows and verified with `npm run build` (pass).

## task-00201 — UI/UX — Create unsaved warning + compliance panel cleanup

- Status: **Done**
- Branch: `feat/ui/task-00201-create-unsaved-warning-compliance-cleanup`
- Scope delivered:
  - Added Create unsaved-content navigation warning on route changes away from `/app/create` (including left-nav/app-shell navigation).
  - Added explicit user choice dialog: stay vs leave-without-saving.
  - Implemented meaningful-change gating to prevent over-triggering when nothing substantive changed.
  - Reduced compliance panel visual weight and removed supporting subtitle under Compliance Feedback.
  - Made compliance API success line smaller/discreet.
  - Removed Selected Finding Actions section and moved remediation actions to per-finding card controls.
  - Removed sticky/pinned Run Compliance Check behavior so panel scrolls naturally.
  - Updated docs and lane report; verified build success.

## task-00200 — UI — CRM Add New Lead modal flow

- Status: **Done**
- Branch: `feat/ui/task-00200-crm-add-lead-modal`
- Scope delivered:
  - Converted CRM **Add New Lead** from inline panel to modal dialog opened from the toolbar button.
  - Kept leads table/list as the default in-page primary surface while create form now overlays in modal context.
  - Added full close behavior support: top-right **X**, **Cancel** action, backdrop click, and **Escape** key.
  - Preserved existing validation + create API behavior and field-level flow; create errors remain visible in modal.
  - On successful create, modal closes, leads list refreshes, and clear success feedback remains visible in CRM page body.
  - Added dialog accessibility semantics (`role="dialog"`, `aria-modal`, title association) with modal focus management and tab-loop containment.
  - Updated UI docs/changelog/lane report and ran `npm run build` (pass).

## task-00199 — UI — Tighten expanded left-nav width / reduce right whitespace

- Status: **Done**
- Branch: `fix/ui/task-00199-nav-expanded-width-tighten`
- Scope delivered:
  - Reduced expanded sidebar track width so nav labels no longer sit with excess right-side whitespace.
  - Updated expanded width values in `src/app/globals.css`:
    - default: `minmax(14rem, 15rem) -> minmax(12.75rem, 13.5rem)`
    - `@media (max-width: 1200px)`: `13rem -> 12.25rem`
    - `@media (max-width: 860px)`: `12rem -> 11.5rem`
  - Kept icon sizing and label readability intact (no changes to icon slot/render size, label font size, or row height).
  - Preserved hover-expand/auto-collapse behavior and prior anti-jitter alignment fixes by leaving collapsed-state selectors/transitions untouched.
  - Preserved mobile/off-canvas behavior and drawer width contract at `<=900px`.
  - Updated UI docs/changelog/lane report and ran `npm run build` (pass).

## task-00198 — UI — Create toolbar tooltips + compliance panel default minimize behavior

- Status: **Done**
- Branch: `fix/ui/task-00198-tooltip-compliance`
- Scope delivered:
  - Added delayed editor toolbar tooltips (~500ms) that remain visible while hovered/focused, with graceful delayed hide and keyboard-accessible `title`/ARIA semantics.
  - Updated Create compliance panel behavior to load minimized by default and provide a clear reopen control.
  - When minimized on desktop, compliance panel slides out and Create main/editor area expands to full width.
  - Removed sticky/lingering compliance side behavior that caused persistent hover footprint while collapsed.
  - Preserved compliance functionality, responsive/nav/editor stability work from recent tasks, and existing reopen/minimize controls.
  - Updated UI docs/changelog/lane report and ran `npm run build` (pass).

## task-00197 — UI/COO docs — Configure Features list refresh

- Status: **Done**
- Branch: `chore/ui/task-00197-update-features-list`
- Scope delivered:
  - Updated `/app/configure/features` copy to reflect current shipped capability set in plain-language operator terms.
  - Refreshed feature grouping to cover Lexical editor maturity, responsive nav behavior, CRM basics, and Events wizard/API status.
  - Added explicit in-progress note that outbound event email plumbing remains intentionally deferred to a later phase.
  - Kept Features page scannable with concise grouped bullets and non-technical-first wording.
  - Updated supporting docs/changelog/lane report and ran `npm run build` (pass).

## task-00196 — UI — Create mobile responsiveness + mobile nav expanded-label fix

- Status: **Done**
- Branch: `fix/ui/task-00196-create-mobile-and-nav-label-fix`
- Scope delivered:
  - Fixed mobile nav expanded-state label visibility by scoping collapsed-label hide selectors so they no longer apply when off-canvas nav is open on phone.
  - Completed Create page phone-width responsiveness cleanup: stacked header/summary/history/control rows, improved action-button reachability, and reduced overflow/clipping risk in narrow viewports.
  - Preserved prior nav jitter/row-height stability contracts and desktop behavior.
  - Updated `docs/UI_FOUNDATIONS.md`, `docs/CHANGELOG.md`, and UI lane report.
  - Ran `npm run build` (pass).

## task-00195 — UI — responsive design pass across primary app surfaces

- Status: **Done**
- Branch: `feat/ui/task-00195-responsive-design-pass`
- Scope delivered:
  - Implemented broad responsive layout fixes across Create, Library, Campaigns, Events, CRM, Configure (+ subpages), Help Center, and app shell/nav behavior.
  - Added mobile/off-canvas nav behavior with header Menu toggle and non-blocking overlay/backdrop interaction on small viewports.
  - Improved small-screen control stacking, header/action wrapping, content spacing, and card/form density across core pages.
  - Added CRM responsive fallback cards for mobile while preserving table-first desktop/tablet behavior and horizontal scroll support.
  - Updated UI foundations/changelog/lane report and ran `npm run build` (pass).

## task-00194 — UI — CRM inline Add New Lead control above leads table

- Status: **Done**
- Branch: `feat/ui/task-00194-crm-add-button-inline`
- Scope delivered:
  - Removed dedicated standalone new-lead section/card framing from `/app/crm`.
  - Moved **Add New Lead** to a compact inline toolbar button directly above the leads table area.
  - Kept leads table as primary visual focus and preserved search + filtering behavior.
  - Preserved existing create-lead validation/API flow by revealing the same form inline under the toolbar button.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00193 — UI/DEV — Nav font adjustment + CRM leads-first table refactor

- Status: **Done**
- Branch: `feat/ui/task-00193-nav-font-and-crm-table-refactor`
- Scope delivered:
  - Reduced left-nav label typography size (`1.2rem -> 1.13rem`) while keeping icon render/slot sizes unchanged.
  - Preserved nav row-height and collapse/expand stability contracts (no row metric changes).
  - Refactored `/app/crm` default view to table-first layout with larger, cleaner lead table as primary focus.
  - Added client-side searchable leads table (name/email/source/status query matching).
  - Moved New Lead form behind an **Add New Lead** toggle so default footprint is compact and form is on-demand.
  - Preserved existing create/list API behavior and validation feedback flow.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00192 — UI — Left-nav label font down + brand-palette icon refinement

- Status: **Done**
- Branch: `feat/ui/task-00192-nav-font-down-icon-palette`
- Scope delivered:
  - Reduced left-nav label typography size (`1.36rem -> 1.2rem`) while keeping nav icon render/slot sizing unchanged.
  - Applied per-item icon color mapping across primary nav using teal/blue/orange brand-family tones derived from `#0298B8`, `#0664B5`, and `#E46A0C`.
  - Added explicit CRM icon class wiring so all nav items use deterministic route-level icon color classes.
  - Kept existing nav row-height/alignment stability contracts intact (no row metric changes; no collapse/expand jitter regressions).
  - Added dark-scheme icon tint overrides to preserve contrast/readability on darker surfaces.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00191 — UI/DEV — Lexical selection-command + link/list hotfix

- Status: **Done**
- Branch: `fix/ui/task-00191-lexical-selection-command-fix`
- Scope delivered:
  - Fixed command-targeting behavior so inline/align/list toolbar actions require an active Lexical range selection and apply to the selected range/blocks rather than falling back to document-level behavior.
  - Replaced native `window.prompt` link flow with an inline toolbar popover editor (URL input + apply/remove/cancel) and preserved selection while editing URL to ensure link apply/remove executes on intended text.
  - Fixed list toggle behavior to cleanly wrap/unwrap selected blocks (bullet/number/check) without content wipe regressions.
  - Hardened rich-text contract sanitization to preserve underline/strike inline decorations by allowing safe span text-decoration styles needed by Lexical HTML serialization.
  - Re-verified generate→editor hydration, draft save/load, and compliance extraction behavior after command/link/list fixes.
  - Updated UI docs/changelog/lane report and verified build with `npm run build` (pass).

## task-00190 — UI/DEV — Lexical editor functionality sweep + stabilization

- Status: **Done**
- Branch: `fix/ui/task-00190-lexical-functionality-sweep`
- Scope delivered:
  - Completed full Lexical toolbar audit and repaired inert/stuck controls by fixing selection-state detection across inline, block, list, link, and alignment actions.
  - Removed default-stuck active indicators (paragraph/align-left no longer pre-selected without a valid range selection).
  - Stabilized editor interaction loop by ensuring toolbar selection listeners read from editor state and by ignoring selection-only change events in content sync.
  - Hardened rich-text persistence contract so toolbar-supported formats survive save/load (added strike/code/pre preservation and bounded text-align style allowlist for block nodes).
  - Verified Create flows for typing/editing, toggle on/off behavior, list/heading/link/align controls, generate→editor hydration, save/load drafts, and compliance text extraction.
  - Added concise Lexical QA checklist in `docs/UI_FOUNDATIONS.md`.
  - Verified build with `npm run build` (pass).

## task-00189 — UI — Auto-collapse Create input panel after successful generate

- Status: **Done**
- Branch: `feat/ui/task-00189-auto-collapse-input-panel-after-generate`
- Scope delivered:
  - Updated Create generate controls in `src/ui/editor-shell.tsx` so the active input section (Topics/Purpose or AI Prompt) auto-collapses only after successful draft generation.
  - Added a compact, obvious **Edit inputs** reopen control in the collapsed state, shared across both input modes.
  - Kept input-mode behavior consistent: collapse/reopen pattern now applies equally to Topics and AI Prompt paths.
  - Preserved selected mode and existing field values (topics/purposes selections and prompt text) when re-opening inputs.
  - Kept generate/save/compliance/remediation/history flows intact.
  - Updated supporting Create styles in `src/app/globals.css` for collapsed-state summary + compact reopen control.
  - Verified build with `npm run build` (pass).

## task-00188 — UI/DEV — Lexical Create editor typing/input hotfix

- Status: **Done**
- Branch: `fix/ui/task-00188-lexical-editor-typing-bug`
- Scope delivered:
  - Identified root cause of unreliable typing: editor content was being re-imported into Lexical on nearly every keystroke due to sync-loop coupling between parent value updates and SyncValuePlugin hydration logic.
  - Hardened Lexical sync boundary so external value hydration is skipped when incoming value already matches the editor's latest emitted normalized HTML.
  - Updated change extraction path to read editor state (no nested update call) and track last-known HTML for stable cursor/composition behavior during typing.
  - Preserved toolbar behavior and selection retention semantics while removing typing/input instability.
  - Verified build with `npm run build` (pass).

## task-00187 — DEV/UI — CRM basic lead tracking space phase 1

- Status: **Done**
- Branch: `feat/dev/task-00187-crm-basic-space-phase1`
- Scope delivered:
  - Added primary nav item **CRM** and `/app/crm` landing page route.
  - Added basic CRM UI with lead list + create form for `name`, `email`, optional `phone`, optional `source`, `status`.
  - Added protected internal API routes for CRM leads (`GET/POST /api/internal/crm/leads`) with fail-closed validation + safe errors.
  - Added Supabase model helper `src/lib/supabase/leads.ts` and docs-based manual SQL bootstrap guidance for `public.leads`.
  - Updated API/UI/changelog/agent-report docs and ran `npm run build` (pass).

## task-00185 — UI — Events list/create wizard live internal API wiring

- Status: **Done**
- Branch: `feat/ui/task-00185-events-list-live-data-wiring`
- Scope delivered:
  - Wired `/app/events` list view to live internal events API (`GET /api/internal/events`) with clear loading, empty, error, and retry UX states.
  - Wired Events wizard submit in `/app/events/new` step 2 to live create API (`POST /api/internal/events`).
  - Preserved existing step-2 communication-planning draft behavior (1-3 editable touchpoints) while adding create persistence on submit.
  - Added explicit operator feedback for create success/error/submitting states and linked post-success navigation back to Events list.
  - Kept UI and interaction patterns aligned with existing `rf-*` status and form styles.
  - Updated UI docs/changelog/lane report and ran `npm run build` (pass).

## task-00184 — DEV — Events DB schema/bootstrap + migration readiness

- Status: **Done**
- Branch: `feat/dev/task-00184-events-db-schema-bootstrap`
- Scope delivered:
  - Inspected task-00181 Events internal API/model contracts and derived canonical Supabase schema requirements.
  - Added idempotent bootstrap SQL at `docs/events_bootstrap.sql` for required tables/indexes:
    - `events`
    - `event_registrations`
    - `event_registration_intents`
  - Aligned DB field names/types/defaults/check constraints with phase-1 API contracts (status + attendance intent enums, bounded text lengths, timestamp defaults).
  - Added boundary docs clarifying table mapping + defensive intent-table posture and manual-apply requirement.
  - Confirmed no migration runner exists in repository scripts; operator-ready manual SQL apply path documented.
  - Ran `npm run build` (pass).

## task-00186 — SEC — Events APIs guard/validation posture verification

- Status: **Done**
- Branch: `chore/sec/task-00186-events-api-guard-validation`
- Scope delivered:
  - Verified auth guard coverage on currently wired Events internal endpoints (`GET/POST /api/internal/events`, `POST /api/internal/events/registrations`).
  - Verified `Cache-Control: no-store` coverage on success/error/unauthorized responses for reviewed endpoints.
  - Verified registration payload validation posture for PII-sensitive fields (allowlist, normalization, bounds, deterministic error mapping).
  - Documented compat-mode auth caveat and go/no-go decision in `docs/SECURITY_BASELINE.md`.
  - Updated changelog and sec lane report for traceability.

## task-00182 — UI — Events wizard phase 2 (pre-event communications setup)

- Status: **Done**
- Branch: `feat/ui/task-00182-events-wizard-step2-comms`
- Scope delivered:
  - Extended `/app/events/new` into a 2-step local wizard flow with clear progress + step transitions.
  - Added step-2 communication planner supporting 1-3 pre-event email touchpoints.
  - Added per-touchpoint schedule metadata fields (days-before + local send time) and editable subject/body placeholders.
  - Kept implementation intentionally local/draft-only (no send plumbing).
  - Updated `docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`, and `docs/agent-reports/railfin-ui.md`.
  - Ran `npm run build` (pass).

## task-00183 — SEC — Events registration safety pass phase 1

- Status: **Done**
- Branch: `chore/sec/task-00183-events-registration-safety-pass`
- Scope delivered:
  - Reviewed current Events create/registration surfaces and API validation presence: event create is local UI state only; registration API/validation remains pending implementation.
  - Added explicit phase-1 findings + gate decision in `docs/SECURITY_BASELINE.md` for upcoming registration enablement.
  - Added concrete checklist for registration PII handling and retention defaults (allowlist validation, PII-safe logging, retention/deletion defaults, export restrictions, and pre-enable verification tests).
  - Updated changelog and sec lane report for task traceability.

## task-00180 — SEC — Events v0.2 safety baseline phase 1

- Status: **Done**
- Branch: `chore/sec/task-00180-events-safety-baseline`
- Scope delivered:
  - Added Events v0.2 security baseline checklist to `docs/SECURITY_BASELINE.md` covering registration data-field handling, QR check-in trust model controls, and attendance/no-show segmentation safety.
  - Added explicit deferred-email-plumbing safety note to keep outbound sends disabled in this phase.
  - Added concrete acceptance criteria gates required before enabling real outbound attendance/no-show sends later.
  - Updated sec lane report and changelog for task traceability.

## task-00178 — DEV/COO — Milestone state formalization (v0.1 locked, v0.2 Events roadmap)

- Status: **Done**
- Branch: `chore/dev/task-00178-v0.1-v0.2-milestone`
- Scope delivered:
  - Formalized current application milestone as **v0.1 (MVP locked)** across planning/reporting docs.
  - Declared **v0.2 roadmap focus: Events Module** with phased delivery slices for execution sequencing.
  - Added explicit Events PRD ownership/status header for v0.2 planning control.
  - Updated consolidated and lane reports with milestone-state note for COO/DEV alignment.

## Milestone state (effective 2026-03-04)

- **Current milestone:** `v0.1 (MVP locked)`
- **Next milestone:** `v0.2 (Events Module focus)`
- **v0.2 phased delivery slices:**
  1. Events entity + operator UI shell (CRUD + lifecycle states)
  2. Registration capture flow + storage contracts
  3. QR issuance + day-of check-in workflow
  4. Post-event communication branching by attendance outcome
  5. Delivery-channel integration hardening (email send plumbing and operational controls)

## task-00177 — UI — Reduce left-nav brand logo size by half (again)

- Status: **Done**
- Branch: `feat/ui/task-00177-logo-reduce-half-again`
- Scope delivered:
  - Reduced the current top-left Railfin logo display size by exactly 50% across active breakpoints (`5.5rem -> 2.75rem`, `5rem -> 2.5rem`, `4.3rem -> 2.15rem`).
  - Preserved fixed logo-anchor wrapper behavior to keep collapse/expand brand alignment stable (no horizontal/vertical jitter introduced).
  - Rebalanced brand block/sidebar track sizing back to pre-task-00174 values to maintain nav readability/usability and spacing.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00176 — UI — Events icon update + left-nav color harmony

- Status: **Done**
- Branch: `feat/ui/task-00176-nav-icon-color-harmony`
- Scope delivered:
  - Changed left-nav **Events** icon to Lucide `Tickets`.
  - Replaced per-item nav icon colors with cohesive Railfin-complementary palette: Create `#1d4ed8`, Library `#6d28d9`, Campaigns `#0f766e`, Events `#0369a1`, Help Center `#4338ca`, Configure `#334155`.
  - Preserved nav sizing/geometry and existing collapse/expand stability behavior.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00175 — UI — Left-nav icon mapping update

- Status: **Done**
- Branch: `feat/ui/task-00175-nav-icon-map-update`
- Scope delivered:
  - Updated left-nav icon mapping per request: Create→`pickaxe`, Library→`book-open-text`, Campaigns→target-arrow (Lucide `Goal` SVG geometry from repo source), Help Center→`life-buoy`, Configure→`settings`.
  - Preserved nav icon sizing/color behavior and existing collapse/expand stability fixes by keeping icon render/stroke + class wiring unchanged.
  - Documented previous icon set as default fallback reference in `src/ui/app-shell.tsx` and UI foundations docs.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00174 — UI — Double left-nav brand logo size

- Status: **Done**
- Branch: `feat/ui/task-00174-double-logo-size`
- Scope delivered:
  - Doubled the current left-nav brand logo display size by 2x across desktop and responsive breakpoints.
  - Preserved fixed horizontal logo anchoring and existing collapse/expand animation stability behavior (no jitter regressions introduced).
  - Rebalanced brand block spacing and expanded sidebar track widths to prevent overlap/crowding and keep nav items usable.
  - Preserved responsive shell behavior and collapsed-rail interactions.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00173 — UI — Remove duplicate in-page page titles

- Status: **Done**
- Branch: `feat/ui/task-00173-remove-in-page-duplicate-titles`
- Scope delivered:
  - Audited shell pages for duplicate labels already represented in the top app header.
  - Removed visible duplicate in-content page-title headings on Create/Library/Configure/Events.
  - Kept page semantics accessible via screen-reader-only headings where visible labels were removed.
  - Preserved spacing/visual rhythm with small subtitle spacing modifiers.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00172 — UI — Lock nav logo horizontal anchor across collapse/expand

- Status: **Done**
- Branch: `feat/ui/task-00172-logo-horizontal-jitter-fix`
- Scope delivered:
  - Fixed remaining top brand horizontal jitter by locking the logo into a fixed-width anchor slot that does not change between collapsed and expanded sidebar states.
  - Kept brand row alignment mode constant (`justify-content: flex-start`) across states and removed any state-dependent brand row geometry shifts.
  - Preserved label/word visibility behavior using non-positional transitions (`clip-path` + `opacity`) so wordmark hide/reveal does not move the logo anchor.
  - Kept nav usability and prior row consistency improvements intact.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00171 — UI/DEV — Final nav jitter fix + app-shell SHA badge

- Status: **Done**
- Branch: `feat/ui/task-00171-nav-jitter-fix-and-sha-badge`
- Scope delivered:
  - Removed remaining collapse/expand micro-jitter by eliminating layout-affecting label width transitions and switching nav label hide/reveal to clip-path + opacity only.
  - Fixed brand/logo drift by keeping brand container alignment metrics identical in both states (no collapsed-state justify-content change).
  - Kept icon/label/logo containers on stable x/y anchors while sidebar track width animates; no row/brand reflow behavior during nav transitions.
  - Added an app-shell-level top-right build SHA badge for fast visual version checks on refresh.
  - Wired SHA sourcing from env with robust precedence (Vercel + generic git SHA vars) and safe fallback.
  - Preserved existing hover-expand/delayed-collapse behavior and responsive shell layout.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00170 — UI — Left-nav animation stability + size bump

- Status: **Done**
- Branch: `feat/ui/task-00170-nav-animation-stability-size-bump`
- Scope delivered:
  - Fixed tiny left-nav collapse/expand jitter by removing collapsed-state row metric drift and locking row box metrics in both states.
  - Kept animation scope to label visibility only (`max-width` + `opacity`) and avoided flow-affecting metric animation in collapse transitions.
  - Increased nav row container height by ~20% (`1.84rem -> 2.2rem`).
  - Increased nav label and icon scale by ~20% (`1.13rem -> 1.36rem`, icon slot/SVG `1.2rem -> 1.44rem`, icon render `19 -> 23`).
  - Preserved expanded/collapsed behavior and icon/label alignment cleanly.
  - Updated UI docs/changelog/lane report and re-ran npm run build (pass).
## task-00169 — UI — Nav visual pass 2 + Create initial scroll hard fix

- Status: **Done**
- Branch: `feat/ui/task-00169-nav-visual-pass-and-scroll-fix2`
- Scope delivered:
  - Increased left-nav readability again with a noticeable bump (Lucide icon render `17 -> 19`, icon slot `1.1rem -> 1.2rem`, nav label `1.05rem -> 1.13rem`) while keeping row sizing consistent across states.
  - Applied distinct per-item icon colors (Create/Library/Campaigns/Events/Help/Configure) using a consistent high-contrast palette on white backgrounds.
  - Added extra vertical breathing room in the nav menu container (`.rf-nav-list`) with top/bottom internal padding and slightly increased row gap.
  - Fixed persistent Create initial offset by hardening shell route scroll reset behavior to cover pathname transitions and reset both window/document + shell container scroll positions, including a post-transition frame reset.
  - Removed Lexical sync-time cursor placement (`root.selectEnd`) that could still trigger browser scroll jumps into the editor region during initial hydration.
  - Preserved nav row consistency/usability with fixed row-height contract retained and unchanged collapse-label interaction model.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00168 — UI — Nav scale bump + initial scroll/load offset fix

- Status: **Done**
- Branch: `feat/ui/task-00168-nav-scale-and-initial-scroll-fix`
- Scope delivered:
  - Increased left-nav visual hierarchy with a moderate icon/text size bump (Lucide icon render 15→17, nav icon slot 1rem→1.1rem, nav label size to 1.05rem) while preserving compact menu density.
  - Preserved task-00167 row-height hard fix by keeping a strict fixed row height (`height/min-height/max-height: 1.72rem`) and unchanged collapse-label-only animation behavior.
  - Fixed initial load/page-offset behavior by enforcing top-of-content reset on route render in AppShell and disabling browser auto scroll restoration for shell routes (`window.history.scrollRestoration = "manual"` + explicit `window.scrollTo(0,0)`).
  - Preserved hover/focus sidebar expand and delayed auto-collapse interaction model/usability.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00167 — UI — Left-nav row-height hard fix across all states

- Status: **Done**
- Branch: `feat/ui/task-00167-nav-row-height-hard-fix`
- Scope delivered:
  - Fixed root cause of oversized/inconsistent nav row heights by replacing stretch-prone grid nav list layout with a column flex stack (`.rf-nav-list`) that never distributes extra vertical space across rows.
  - Enforced a single fixed nav row height in all states (`height/min-height/max-height: 1.72rem`) and removed vertical padding-based growth from `.rf-nav-item`.
  - Kept icon + label vertically centered with explicit flex alignment and line-height normalization on row + label.
  - Prevented collapse/expand from affecting row height/vertical rhythm; only label visibility animation remains (`max-width` + `opacity`).
  - Preserved icon slot size and rendering stability (`.rf-nav-item-icon` fixed 1rem box, no icon transition).
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00166 — UI — Left-nav row height + icon stability on collapse/expand

- Status: **Done**
- Branch: `feat/ui/task-00166-nav-row-height-icon-stability`
- Scope delivered:
  - Tightened left-nav row sizing so each menu item is compact (reduced nav item padding/line-height/gap/min-height).
  - Stabilized icon layer with fixed-size icon container (1rem x 1rem) and explicit no-transition icon rendering to prevent flicker/disappearance during state changes.
  - Kept icon position/size stable between expanded/collapsed states by removing collapsed-state icon centering and animating label reveal/collapse separately.
  - Preserved hover-driven expand and delayed auto-collapse behavior in AppShell.
  - Preserved label readability/usability when expanded with controlled label width/opacity animation.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00165 — UI — Nav logo asset swap + padding trim

- Status: **Done**
- Branch: `feat/ui/task-00165-logo-asset-swap-crop`
- Scope delivered:
  - Replaced the left-nav brand logo asset with the newly provided Railfin logo (`public/brand/railfin-v1.png`).
  - Trimmed transparent outer padding from the source asset so the visible mark renders tighter with minimal dead space.
  - Converted nav behavior to hover-driven auto-expand/collapse: collapsed by default, expands while hovered/focused, and auto-collapses after ~2s when not hovered.
  - Removed bottom nav minimize/maximize controls and related toggle UI.
  - Added Lucide icons to each nav item and compacted nav row vertical spacing so each row is only as tall as needed.
  - Preserved nav usability/responsiveness, existing shell sizing/alignment logic, and crisp logo rendering at current sizes.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00164 — UI — Left nav auto-minimize + width refinement

- Status: **Done**
- Branch: `feat/ui/task-00164-nav-auto-minimize`
- Scope delivered:
  - Added left-nav auto-minimize behavior with ~3s inactivity timeout and auto-expand on nav interaction.
  - Added bottom-nav controls: manual expand/collapse button and `Auto-minimize` toggle (enable/disable).
  - Kept manual expand/collapse interaction available regardless of auto-minimize state.
  - Reduced default sidebar width and added collapsed rail width while preserving content area layout stability.
  - Moved Railfin wordmark onto the same row as logo in nav header.
  - Preserved responsive navigation behavior and updated UI docs/changelog/lane report.
  - Ran `npm run build` (pass).

## task-00163 — UI — Main nav brand logo reduce by 25%

- Status: **Done**
- Branch: `feat/ui/task-00163-logo-reduce-25pct`
- Scope delivered:
  - Reduced the app-shell top-left Railfin logo by 25% from task-00162 sizing (desktop 168px -> 126px, with proportional responsive fallbacks).
  - Kept stacked brand alignment and sidebar navigation usability intact without clipping/overlap.
  - Preserved responsive behavior across desktop and narrower breakpoints.
  - Updated UI foundations/changelog/lane-report docs and re-ran `npm run build` (pass).

## task-00162 — UI — Main nav brand logo shrink by half

- Status: **Done**
- Branch: `feat/ui/task-00162-logo-shrink-half`
- Scope delivered:
  - Reduced the app-shell top-left Railfin logo size by ~50% from the oversized task-00161 values (desktop 336px -> 168px, with proportional responsive fallbacks).
  - Rebalanced sidebar track sizing so branding remains prominent without crowding primary navigation readability.
  - Preserved responsive behavior across desktop/narrow breakpoints while keeping the stacked logo + wordmark treatment.
  - Updated UI foundations/changelog/lane-report docs and re-ran `npm run build` (pass).

## task-00161 — UI — Main nav brand logo size tripled

- Status: **Done**
- Branch: `feat/ui/task-00161-nav-logo-size-triple`
- Scope delivered:
  - Increased the app-shell top-left Railfin logo from 112px to 336px (~3x).
  - Rebalanced brand area spacing/layout so the oversized logo sits above nav items without clipping/overlap and keeps the Railfin text present but de-emphasized.
  - Expanded desktop sidebar width and added responsive size/track fallbacks so navigation interactions remain usable at narrower breakpoints.
  - Updated UI foundations/changelog/lane-report docs and re-ran `npm run build` (pass).

## task-00160 — UI — Main nav brand logo size doubled again

- Status: **Done**
- Branch: `feat/ui/task-00160-nav-logo-size-double-again`
- Scope delivered:
  - Increased the app-shell top-left Railfin logo from 60px to 112px (roughly 2x larger again).
  - Reworked brand container alignment for the oversized mark by stacking logo + wordmark and tuning spacing/text prominence.
  - Expanded desktop sidebar track and kept responsive fallback sizing so navigation remains usable on common desktop widths.
  - Updated UI foundations/changelog/lane-report docs and re-ran `npm run build` (pass).

## task-00159 — UI — Main nav brand logo size increase

- Status: **Done**
- Branch: `feat/ui/task-00159-nav-logo-size-increase`
- Scope delivered:
  - Increased the app-shell top-left Railfin logo from 28px to 60px (>=2x visual size target).
  - Rebalanced brand row spacing/alignment for larger mark readability via updated logo sizing and brand text line-height treatment.
  - Adjusted desktop sidebar column width to preserve clean nav spacing with the larger brand mark, with responsive fallback at narrower widths.
  - Updated UI foundations/changelog/lane-report docs and re-ran `npm run build` (pass).

## task-00158 — UI/DEV — Align Generate/Lock placement across Topics + AI Prompt modes

- Status: **Done**
- Branch: `feat/ui/task-00158-generate-buttons-topics-prompt`
- Scope delivered:
  - Added **Generate Content** action in Topics mode and aligned action order under mode content: **Lock Prompt** then **Generate Content**.
  - Moved prompt-mode action row so Lock/Generate now render beneath the AI prompt textarea (instead of prompt header).
  - Unified generation entrypoint so both Topics mode and AI Prompt mode call the same generate pipeline and preserve selected `contentType`, `topics[]`, and `purposes[]` in request context.
  - Added Topics-mode prompt scaffolding fallback in UI so generation remains possible from Topics mode while backend prompt context still receives selected topic/purpose/type data.
  - Preserved save/compliance/history/remediation behavior (no contract or remediation-flow regressions).
  - Updated UI/API/changelog/lane-report docs and ran `npm run build` (pass).

## task-00157 — DEV/UI — Create topics/purpose UX additions + generation wiring

- Status: **Done**
- Branch: `feat/dev/task-00157-topics-purpose-generation-wiring`
- Scope delivered:
  - Moved the four content-type buttons above the **Create content by:** selector container.
  - Added toggleable Topics options in Topics mode: **Tax Season 2026**, **AI and Jobs**, **Financial Wellness**.
  - Added toggleable Purpose options: **Lead Outreach**, **Social Growth**, **Follower Growth**.
  - Kept toggle state explicit via active/inactive button styling + `aria-pressed` semantics.
  - Wired Create generation requests to include selected `contentType`, `topics[]`, and `purposes[]`.
  - Extended backend generation prompt scaffold to inject selected topics/purposes into model context.
  - Preserved non-breaking defaults when none selected (`none selected` in scaffold / empty selection arrays).
  - Updated UI/API/changelog/lane-report docs and ran `npm run build` (pass).

## task-00156 — UI — Create input-mode UX refine + copy cleanup

- Status: **Done**
- Branch: `feat/ui/task-00156-create-input-mode-ux-refine`
- Scope delivered:
  - Removed the Create header fallback phrase `Policy last updated: unavailable` from the visible Create surface.
  - Removed the `Content Type` label text and eliminated the separate tile/wrapper around content-type choices.
  - Added a content-creation method selector with two options: **Select a few topics** and **AI prompt**.
  - Implemented single-container mode swapping so the same control container toggles between topics selection UI and prompt input UI.
  - Kept the four content-type buttons directly above the prompt input area in AI prompt mode for faster scan/use.
  - Removed the Save-stage helper copy: `Save once you are satisfied with review and remediation updates.`
  - Preserved existing generate/save/compliance/remediation/history flows and updated docs/lane report.
  - Re-ran `npm run build` (pass).

## task-00154 — UI — Lexical toolbar icon-only solid row

- Status: **Done**
- Branch: `feat/ui/task-00154-toolbar-icon-only-solid-row`
- Scope delivered:
  - Converted Lexical toolbar controls to icon-only buttons (removed visible text labels) while preserving per-control `aria-label` and existing commands/behavior.
  - Removed inter-button/group spacing so the toolbar reads as one continuous neutral control strip.
  - Enforced single-row toolbar layout with horizontal overflow on narrow widths (no wrapping).
  - Preserved active-state clarity and neutral styling treatment.
  - Updated docs/lane report and validated with `npm run build` (pass).
## task-00153 — UI — Lexical toolbar common options expansion

- Status: **Done**
- Branch: `feat/ui/task-00153-lexical-toolbar-common-options`
- Scope delivered:
  - Expanded Lexical toolbar to include standard rich-text controls: bold, italic, underline, strikethrough; H1/H2/H3 + paragraph; bullet/numbered/check lists; blockquote + code block; link/unlink; left/center/right alignment; undo/redo; clear formatting.
  - Kept neutral grey toolbar visual style and Lucide icon + label pattern.
  - Preserved accessibility/interaction semantics with toolbar grouping, `aria-label`, `aria-pressed`, disabled undo/redo state, and mouse-down selection preservation for keyboard-safe editing.
  - Kept Create/generate/save/compliance/remediation flows unchanged (toolbar-only/editor-command layer change).
  - Added Lexical nodes/plugins needed for features (code + link) and validated with `npm run build` (pass).

## task-00152 — UI — Lexical toolbar Lucide icon pass

- Status: **Done**
- Branch: `feat/ui/task-00152-lexical-toolbar-lucide`
- Scope delivered:
  - Added `lucide-react` dependency and replaced Lexical toolbar text/symbol controls with Lucide icon + label buttons.
  - Kept toolbar visual language neutral/grey (non-CTA) and aligned with demo-style top editor bar aesthetics.
  - Preserved active-state and accessibility semantics (`aria-pressed`, visible active treatment, toolbar grouping/labels).
  - Kept editor behavior/commands unchanged (visual/control layer update only).
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00149 — UI — Lexical UX stabilization pass (post phase-1)

- Status: **Done**
- Branch: `feat/ui/task-00149-lexical-ux-stabilization`
- Scope delivered:
  - Styled Lexical toolbar to neutral demo-style hierarchy (grey top bar, grouped controls, icon+label affordance, non-primary button treatment).
  - Added live active-state affordances (`aria-pressed` + visual state) for bold/italic/heading/list tools.
  - Kept Lexical React setup explicit and conventional (`LexicalComposer`, `RichTextPlugin`, `ContentEditable`, `HistoryPlugin`, `OnChangePlugin` + toolbar update listener).
  - Tuned editor viewport behavior for split layout: sticky desktop toolbar, bounded editor viewport/internal scrolling, and mobile fallback to normal page flow.
  - Added editor-ready gating so prompt lock / generate / save stay disabled until Lexical hydration completes.
  - Preserved currently working save/load/compliance/library-preview flows.
  - Re-ran `npm run build` (pass after clean `.next`).

## task-00150 — DEV — Lexical data-contract hardening

- Status: **Done**
- Branch: `feat/dev/task-00150-lexical-data-contract-hardening`
- Scope delivered:
  - Hardened Lexical serialization/deserialization boundaries through a dedicated contract utility (`src/ui/lexical-contract.ts`) with HTML sanitization/normalization and bounded payload handling.
  - Added safe normalization on draft load to handle malformed/legacy body content (including plain-text legacy drafts) before editor hydration.
  - Made compliance extraction deterministic and bounded by normalizing HTML→text with explicit max-length enforcement.
  - Updated API boundary + changelog documentation for contract-hardening behavior.
  - Re-ran npm run build (pass).

## task-00151 — SEC — Lexical safety review phase 1

- Status: **Done**
- Branch: `chore/sec/task-00151-lexical-safety-review`
- Scope delivered:
  - Reviewed Lexical HTML save/load/render path for injection/sanitization risk across Create + Library surfaces.
  - Verified compliance input extraction remains plain-text based and does not execute HTML/markup in request flow.
  - Documented residual hidden-markup normalization risk and follow-up hardening recommendation in security baseline.
  - Updated security docs/changelog and sec lane report; no code change required.
  - Build not run (docs-only review; no runtime changes).

## task-00148 — UI/DEV — Lexical integration phase 1 (AI + compliance workflow)

- Status: **Done**
- Branch: `feat/ui/task-00148-lexical-phase1-ai-compliance`
- Scope delivered:
  - Replaced Create textarea editor with Lexical editor as primary content surface.
  - Added baseline formatting toolbar (bold/italic/heading/lists/paragraph).
  - Wired AI generate output into Lexical editor hydration path.
  - Kept compliance check flow working by reading current Lexical plain text.
  - Standardized draft persistence to HTML serialization for rich text retention; load/open path hydrates stored HTML back into Lexical.
  - Deferred remediation apply/regenerate actions safely (disabled with explicit temporary note).
  - Updated UI/API/changelog docs and re-ran `npm run build` (pass).

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

## task-00215 — DEV — Campaigns execution engine skeleton (enrollments + step progression)

- Status: **Done**
- Branch: `feat/dev/task-00215-campaigns-execution-engine-skeleton`
- Scope delivered:
  - Added campaign execution enrollment API surfaces:
    - `GET/POST /api/internal/campaigns/[campaignId]/enrollments`
    - `POST /api/internal/campaigns/enrollments/[enrollmentId]/transition`
  - Added enrollment service contracts for create/start, list/status by campaign, and deterministic transition execution.
  - Added deterministic step progression skeleton:
    - `email` step => records send-intent transition event only (no external send)
    - `wait` step => computes/persists `nextEligibleAt`
    - `condition` step => deterministic `if|or` rule evaluation scaffold against `contactContext` and branch sequence selection
  - Added enrollment state consistency and minimal audit/event trail persistence in Supabase helper layer (`campaign_enrollment_events`).
  - Added strict fail-closed validation and safe `fieldErrors` for all new execution endpoints.
  - Updated docs (`tasks`, `CHANGELOG`, `API_BOUNDARY`, `agent-reports/railfin-dev`) and ran `npm run build` (pass).

## task-00214 — DEV — Configure APIs catalog page (internal + external)

- Status: **Done**
- Branch: `feat/dev/task-00214-config-apis-catalog-page`
- Scope delivered:
  - Added new Configure subpage route `/app/configure/apis` with shortcut redirect `/configure/apis`.
  - Added Configure subnav entry **APIs** between Features and Change Log.
  - Built operator-facing API catalog UI with searchable table sections:
    - **Internal APIs**: sourced from current `src/app/api/internal/*` routes + `docs/API_BOUNDARY.md`.
    - **External APIs**: includes currently implemented login contract endpoint and explicit planned placeholders (OpenAI runtime, email provider).
  - Internal catalog rows include endpoint path, methods, concise description, key params/body fields, and auth expectation.
  - Added deterministic source references per row (route file/docs location) to avoid fabricated contract surfaces.
  - Updated docs (`tasks`, `CHANGELOG`, `API_BOUNDARY`, `UI_FOUNDATIONS`, `agent-reports/railfin-dev`).
  - Build verification: `npm run build` (pass).

## task-00211 — DEV — Contacts generalization pass (CRM leads -> contacts bridge hardening)

- Status: **Done**
- Branch: `feat/dev/task-00211-contacts-generalization`
- Scope delivered:
  - Added contacts-first Supabase persistence helper (`src/lib/supabase/contacts.ts`) with required SQL bootstrap metadata and safe blocked diagnostics.
  - Added CRM normalization bridge (`src/api/internal/crm/normalization.ts`) to map lead shape <-> contacts shape while preserving existing CRM lead UI contract fields.
  - Updated contacts API core (`src/api/internal/crm/contacts.ts`) with contacts-table-first reads, leads fallback when contacts table is absent, new list filters (`search`, `stage`, `source`), and strict fail-closed create/update validation.
  - Added contacts route write surfaces:
    - `POST /api/internal/crm/contacts`
    - `PATCH /api/internal/crm/contacts/[contactId]`
  - Hardened leads API bridge (`src/api/internal/crm/leads.ts`) to read via contacts-first mapping and write to contacts first with fallback to legacy leads table.
  - Added deterministic/manual idempotent SQL backfill file: `docs/crm_contacts_backfill_from_leads.sql` with verification queries.
  - Updated API boundary, changelog, and dev lane report docs.
  - Build verification: `npm run build` (pass).

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

## task-00155 — UI — Help Center landing + starter help topics

- Status: **Done**
- Branch: `feat/ui/task-00155-help-center-landing`
- Scope delivered:
  - Added **Help Center** to primary app navigation (`/app/help`).
  - Added Help Center landing page with hero/welcome copy, non-functional search UI, and starter topic-card grid.
  - Added starter topic coverage for Create onboarding, save/library flow, AI controls, compliance/remediation basics, and Configure/Change Log/Features guidance.
  - Added two concise help detail pages linked from topic cards: `/app/help/getting-started` and `/app/help/compliance-basics`.
  - Added top-level shortcut route `/help` → `/app/help`.
  - Updated UI docs/changelog/lane report and re-ran `npm run build` (pass).

## task-00179 — UI — Events v0.2 UI foundation phase 1

- Status: **Done**
- Branch: `feat/ui/task-00179-events-ui-foundation`
- Scope delivered:
  - Implemented Events landing page with prominent **Create Event** CTA and empty-state-friendly events list section.
  - Added Event creation wizard step-1 screen at `/app/events/new` with local form state fields (title, date, summary, location).
  - Added step-1 submit placeholder behavior (local success state only; no email plumbing).
  - Preserved existing app shell/nav behavior and styling patterns.
  - Updated `docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`, and lane report.
  - Ran `npm run build` (pass).


## task-00181 — DEV — Events v0.2 backend phase 1 (data model + core APIs)
- Status: **Done**
- Branch: `feat/dev/task-00181-events-data-model-and-api-phase1`
- Scope delivered:
  - Added Events + registrations internal model/contracts and in-memory phase-1 store.
  - Added protected internal APIs for event create/list and registration submit.
  - Added fail-closed validation and safe error payloads.
  - Updated API boundary/changelog/dev lane docs and ran `npm run build` (pass).

## task-00224 — DEV — lane smoke change
- Status: **Done**
- Branch: `feat/dev/task-00224-dev-smoke-change`
- Scope delivered:
  - Added lane smoke note to dev agent report.
  - Added changelog smoke entry.
  - Build smoke executed for lane validation.

## task-00226 — SEC — Worktree isolation ops note (smoke docs pass)

- Status: **Done**
- Branch: `feat/sec/task-00226-sec-smoke-doc-pass`
- Scope delivered:
  - Added operations note to SECURITY_BASELINE documenting lane worktree isolation usage to reduce branch drift/cross-lane contamination risk.
  - Updated task/changelog/sec-report docs for traceability.
  - Build step intentionally skipped (docs-only).

## task-00227 — DEV — CRM contacts mutations API (small scope)
- Status: **Done**
- Branch: `feat/dev/task-00227-crm-contacts-mutations-api`
- Scope delivered:
  - Added contacts GET-by-id and DELETE support in internal CRM contacts layer.
  - Added `GET`, `PUT/PATCH`, and `DELETE` handlers for `/api/internal/crm/contacts/[contactId]`.
  - Preserved fail-closed validation, safe errors, auth guard, and no-store headers.
  - Kept contacts persistence + leads compatibility bridge intact.

## task-00229 — DEV — Events mutations API (serialized recovery)
- Status: **Done**
- Branch: `feat/dev/task-00229-events-mutations-api`
- Scope delivered:
  - Added event detail fetch for edit prefill: `GET /api/internal/events/[eventId]`.
  - Added event update support: `PATCH/PUT /api/internal/events/[eventId]`.
  - Added event delete support: `DELETE /api/internal/events/[eventId]`.
  - Preserved auth guard, no-store headers, fail-closed validation, and safe errors.

## task-0030 — UI — Events mutations UI (serialized recovery)
- Status: **Done**
- Branch: `feat/ui/task-0030-events-mutations-ui`
- Scope delivered:
  - Added Edit/Delete controls on Events list cards.
  - Edit now routes to event editor with `eventId` query and prefilled data.
  - Added delete confirmation flow and list refresh after successful delete.

## task-0031 — DEV — Events regression verify/fix
- Status: **Done**
- Branch: `feat/dev/task-0031-events-regression-verify-and-fix`
- Scope delivered:
  - Re-verified `/api/internal/events/[eventId]` route surface supports `GET/PATCH/PUT/DELETE`.
  - Re-verified auth guard and `no-store` headers on events mutation/detail route.
  - Re-ran production build; no regressions detected.
  - No additional API code changes required in this pass.

## task-0033 — UI — CRM contacts count badge
- Status: **Done**
- Scope delivered:
  - Added a compact contacts total badge in the CRM toolbar upper-right area.
  - Kept existing CRM actions/layout behavior unchanged.
