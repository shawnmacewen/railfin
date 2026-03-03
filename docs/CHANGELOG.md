# Railfin Change Log

This change log is written for humans. It tracks major shipped milestones and product-facing improvements.

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
