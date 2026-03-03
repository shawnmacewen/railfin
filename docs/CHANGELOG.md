## 2026-03-03 — Lexical UX stabilization pass (task-00149)
- Aligned Create’s Lexical formatting toolbar to a neutral demo-style bar (grey surface, grouped controls, icon+label feel).
- Removed primary-blue CTA treatment from formatting controls; active state is now clear but neutral.
- Improved split-layout editing comfort with sticky desktop toolbar and bounded internal editor scrolling.
- Added editor-ready guardrails so Prompt Lock / Generate Content / Save Draft wait until Lexical is fully hydrated.
- Kept save/open/compliance/library preview flows stable while improving editing usability.

## 2026-03-03 — Lexical data-contract hardening (task-00150)
- Hardened Create editor HTML boundaries with a dedicated normalization/sanitization layer before persistence and hydration.
- Added safe load-time normalization for malformed/legacy draft bodies so old plain-text drafts and malformed HTML hydrate reliably in Lexical.
- Made compliance content extraction deterministic and bounded by deriving normalized plain text from sanitized HTML with explicit limits.
- Kept API request/response envelopes stable while improving internal safety and consistency for editor contract handling.

## 2026-03-03 — Lexical safety review phase 1 (task-00151)
- Completed SEC review of Lexical HTML save/load/render path across Create and Library workflows.
- Confirmed current flow does not use direct HTML injection sinks (no `dangerouslySetInnerHTML` in reviewed surfaces).
- Confirmed compliance requests are derived from plain text extraction and submitted as JSON text content.
- Documented residual hidden-markup normalization risk plus follow-up sanitizer hardening recommendation in security baseline.
- No runtime code changes in this task (docs-first security verification).

## 2026-03-03 — Lexical editor phase 1 for Create (task-00148)
- Replaced Create’s textarea editor with Lexical as the primary authoring editor.
- Added baseline rich formatting controls: bold, italic, heading, paragraph, bullet list, and numbered list.
- Wired AI generation output to populate Lexical reliably and kept compliance checks reading current editor text.
- Standardized draft persistence to HTML serialization for rich-text retention across save/open flows.
- Deferred remediation apply/regenerate integration in this phase by disabling those actions with clear temporary guidance (no broken path).

# Railfin Change Log

This change log is written for humans. It tracks major shipped milestones and product-facing improvements.

## 2026-03-03 — Create single-content focus + prompt-lock accordion + editor/compliance upgrade (task-00147)
- Removed Create-page Mode switching and focused this workflow on single-content generation only.
- Moved generation action next to prompt lock and renamed it to **Generate Content** for tighter authoring flow.
- Added prompt lock accordion behavior so locking can collapse the instructions area and move editor work higher on screen.
- Expanded editor working space significantly to support longer drafting/remediation sessions.
- Added right-side compliance panel collapse to a slim rail with a persistent top maximize toggle.
- Added lightweight rich-text toolbar options for **bold**, **italic**, and **text color** with low-risk implementation.
- Kept save/compliance/remediation/history-restore flows stable while delivering the UX update.

## 2026-03-03 — Library tile layout + metadata refinement (task-00146)
- Updated Library saved drafts to a responsive tile grid with a 4-column desktop layout and smaller-screen fallbacks.
- Adjusted tile proportions to feel more square and card-like for faster scan in dense libraries.
- Updated created timestamp labels to explicit `Created: <date>` formatting.
- Added a dedicated **Description** section on each tile with a concise 3-line preview and ellipsis truncation.
- Preserved existing Library → Create handoff behavior so opening/editing a draft still routes through `/app/create?draftId=<id>`.

## 2026-03-03 — Create-page UX polish follow-up (task-00145)
- Removed the top Create workflow shortcut row to reduce visual clutter.
- Tightened platform visual language to a 2px corner-radius baseline for core controls, cards, and pills.
- Kept **Campaign Package** visible in mode controls but disabled for now to show upcoming capability without enabling selection.
- Kept content-type choices (Blog, Social Post, Article, Newsletter) on a single horizontal row for faster scanning.
- Removed the visible `1. Generate` label while preserving all existing generate/review/remediate/save functionality.

## 2026-03-03 — Create UX refactor (task-00144)
- Simplified Create-page copy and hierarchy by removing outdated helper text and redundant stage labels.
- Moved Draft Status into a right-aligned header pill for faster save-state scanning.
- Split generation flow into separate AI Instructions input and Editor Content output areas.
- Replaced mode/content-type controls with large active-state buttons (including the 4-option content type set: Blog, Social Post, Article, Newsletter).
- Moved Generation History to the bottom of Create and added in-session prompt lock/reference behavior after generation.
- Documented next milestone: persist every submitted prompt with user-linked audit metadata (user/session/model) in backend storage.

## 2026-03-03 — Configure Features page
- Added a new **Features** page under Configure to clearly explain what the app can do today in plain language.
- Included the new page in Configure navigation so Policy, Features, and Change Log are easy to browse together.
- Captured current capabilities in grouped bullet lists: content generation, campaign package mode, compliance checks, manual remediation actions (including undo), draft save/library handoff, and generation history restore/compare.

## 2026-03-03 — Create UX stabilization phase 2 (split layout ergonomics)
- Improved right-side compliance panel scroll ergonomics so key run/status controls stay visible while findings remain scrollable.
- Reduced left-pane control clutter by grouping generation setup progressively (mode, output target, then action).
- Preserved all existing Create workflows and capabilities (generation modes/history, remediation actions, save/compliance flow) with no feature removals.

## 2026-03-03 — Post-alignment security verification (package API/UX + UX phase2)
- Re-ran security verification for package-mode API/UX alignment after recent Create UX work.
- Confirmed package-mode drift identified in task-00134 is still open: Create package flow still fans out single-mode calls instead of using canonical `mode: "package"` API request.
- Re-confirmed UX phase2 safety surfaces remain intact: degraded-state notices and legal-disclaimer messaging stay visible.
- Re-confirmed remediation actions remain explicit/manual-only (apply, apply+regenerate, undo) with no auto-trigger regression.
- Updated security baseline and task ledger with deterministic gate result: package-alignment closure remains **NO-GO** until canonical API/UX alignment is implemented.

## 2026-03-03 — Split layout UX stabilization (Create + Compliance)
- Fixed stale selected-finding state in the persistent compliance panel so remediation actions cannot target outdated findings after editor content/context changes.
- Improved Create↔Compliance state synchronization by tightening selected-finding identity propagation to the editor workbench.
- Kept API behavior/contracts unchanged; this was a low-risk UI state stability pass.
## 2026-03-03 — Create workflow layout split for persistent compliance
- Redesigned the Create workspace into a responsive split view so drafting controls stay in a larger left workspace while compliance feedback remains visible in a dedicated right panel.
- Added a clearer workflow rhythm in Create (Generate → Review → Remediate → Save) with section shortcuts to reduce context switching.
- Improved mobile behavior with stacked section ordering and sticky workflow shortcuts for faster navigation on small screens.

## 2026-03-03 — Campaign package workflow upgrades
- Added campaign package generation so teams can create multiple channel-ready variants from one prompt.
- Added side-by-side variant comparison with quick copy/restore actions in Create history.
- Added strict package export schema validation to keep package output predictable for downstream tools.
- Completed a security review gate for package export/compare before broader rollout.

## 2026-03-02 — Review workbench and remediation maturity sprint
- Expanded the Create review workbench with clearer selected-finding context and generation history restore.
- Added safer remediation controls: manual apply, protected-zone warnings, one-step undo, and audit trail persistence.
- Improved generation and compliance runtime feedback so operators can quickly see success vs degraded mode.
- Hardened request validation and internal API safety guardrails across content/compliance/configure paths.

## 2026-03-01 — MVP launch evidence and runtime hardening
- Closed major MVP launch readiness evidence items (production draft write/read proof and gate reruns).
- Unified AI service boundary documentation and payload contracts across Generate and Compliance.
- Hardened shared AI runtime provider-chain behavior and diagnostics for predictable fallback handling.

## 2026-02-28 — MVP foundation shipped
- Launched the app shell with persistent navigation (Create, Library, Campaigns, Configure).
- Delivered usable Library draft browse/search flow and Create draft save wiring.
- Added Configure baseline, policy endpoint contract, and policy-to-compliance context plumbing.
- Introduced authentication/middleware baseline guardrails and initial security gate documentation.

## 2026-03-03 — Package UX/API contract alignment (task-00140)
- Updated Create package generation to use the canonical package-mode API request (`mode: "package"` with `package.assets`) in one call.
- Removed package fan-out behavior that previously issued multiple single-mode generate requests.
- Kept single-draft generation backward compatible and explicit (`mode: "single"` + `contentType`).
- Added stricter UI-side handling for package responses so empty/malformed package payloads fail clearly.

## 2026-03-03 — Events module kickoff placeholder + PRD
- Added new `Events` item in app side navigation with `/app/events` placeholder page.
- Added `docs/PRD_Events_Module_v0.md` capturing event lifecycle scope: creation, promotion content, registration, QR check-in, and attendance-based follow-up logic.
- Email delivery plumbing remains intentionally deferred for a later integration phase.
