## 2026-03-04 — SEC — Events v0.2 safety baseline phase 1 (task-00180)
- Added Events v0.2 docs-first security baseline for:
  - registration data fields handling controls
  - QR check-in trust model and replay/validation constraints
  - attendance/no-show communication segmentation safety
- Added explicit deferred-email-plumbing safety note: outbound sends remain disabled in this phase.
- Added acceptance criteria gates required before enabling outbound attendance/no-show email delivery in a future phase.
- Updated security/task/changelog/lane-report docs only; no runtime code changes.

## 2026-03-04 — Left-nav brand logo reduced by half again (task-00177)
- Reduced the app-shell top-left Railfin logo display size by 50% from the current enlarged state across desktop/tablet/mobile shell breakpoints.
- Preserved fixed logo-anchor alignment and existing collapse/expand transition stability contracts to avoid horizontal/vertical jitter regressions.
- Restored sidebar/brand geometry to keep nav spacing and usability balanced after the logo reduction.

## 2026-03-04 — Left-nav Events icon + cohesive brand-harmonic icon palette (task-00176)
- Swapped the app-shell **Events** nav icon from `CalendarDays` to Lucide `Tickets` while preserving existing icon sizing/stroke and sidebar interaction behavior.
- Replaced prior mixed per-item icon colors with a cohesive high-contrast Railfin-complementary palette across primary nav icons.
- Preserved left-nav collapse/expand stability contracts (row metrics, icon slot geometry, label-only visibility transitions) in both expanded and collapsed states.

## 2026-03-04 — Left-nav icon mapping refresh with fallback reference (task-00175)
- Updated app-shell primary nav icons to requested set: Create→Pickaxe, Library→BookOpenText, Campaigns→Goal (target-arrow SVG geometry), Help Center→LifeBuoy, Configure→Settings.
- Kept icon sizing/stroke and per-item icon class wiring unchanged so current nav visual rhythm/colors and collapse/expand jitter fixes are preserved.
- Documented prior/default mapping as explicit fallback reference in code/docs for quick rollback context.

## 2026-03-04 — Left-nav brand logo doubled with stable anchor (task-00174)
- Doubled the app-shell left-nav brand logo display size by 2x across defined breakpoints (desktop/tablet/mobile shell ranges).
- Kept the fixed logo anchor wrapper so logo x-position remains stable during sidebar collapse/expand (no horizontal jitter regressions).
- Increased brand area spacing and widened expanded sidebar tracks to keep nav rows readable and avoid brand/menu overlap with the larger mark.
- Preserved responsive behavior and existing hover/focus expand + delayed auto-collapse interactions.

## 2026-03-04 — Removed duplicate in-page page titles under shell header (task-00173)
- Removed repeated visible page-title headings from in-content surfaces where the same page label is already shown in the app header.
- Applied this consistency pass across Create, Library, Configure, and Events views.
- Kept accessibility semantics by preserving page section headings as screen-reader-only labels.
- Updated Help hero labeling to avoid repeating the page label as visible body text.

## 2026-03-04 — Nav logo horizontal anchor lock (task-00172)
- Fixed residual top-left brand horizontal jitter during sidebar collapse/expand by introducing a fixed logo anchor slot (`.rf-brand-logo-wrap`) that does not shift between states.
- Kept brand row alignment mode constant (`justify-content: flex-start`) and made brand row layout width-stable (`width: 100%`) across collapsed/expanded states.
- Preserved wordmark hide/reveal behavior using non-positional transitions (`clip-path` + `opacity`) so label visibility changes do not move the logo.
- Maintained existing hover-expand + delayed auto-collapse behavior and prior nav row consistency improvements.

## 2026-03-04 — Final nav jitter fix + app-shell SHA badge (task-00171)
- Removed residual left-nav expand/collapse micro-jitter by replacing label width-based animation with clip/opacity-only visibility transitions.
- Fixed top brand drift by stabilizing brand container layout across collapsed/expanded states (no state-specific alignment shift).
- Added a subtle, app-shell-level top-right SHA badge for immediate build/version verification after refresh.
- Added robust SHA resolution precedence from runtime/build env vars with a safe fallback string.
- Preserved existing responsive shell behavior and hover/focus expand + delayed auto-collapse interactions.

## 2026-03-04 — Left-nav animation stability + size bump (task-00170)
- Fixed subtle left-nav collapse/expand jitter by removing collapsed-state row metric drift and keeping nav row box metrics identical across states.
- Kept collapse animation scoped to label visibility only (label width/opacity), avoiding layout-flow animation side effects.
- Increased nav item row height by ~20% (`1.84rem -> 2.2rem`).
- Increased nav readability by another ~20% for label and icon scale (label `1.13rem -> 1.36rem`, icon slot/SVG `1.2rem -> 1.44rem`, icon render `19 -> 23`).
- Preserved hover-expand and delayed auto-collapse behavior with stable icon/label alignment in both nav states.
## 2026-03-04 — Nav visual pass 2 + Create initial scroll hard fix (task-00169)
- Increased left-nav readability with another noticeable scale bump (Lucide icons 17→19, icon slot 1.1rem→1.2rem, nav labels 1.05rem→1.13rem) while preserving consistent row behavior.
- Added unique, consistent, high-contrast colors for each primary nav icon (Create, Library, Campaigns, Events, Help, Configure).
- Added extra top/bottom internal padding in the nav menu container to improve vertical spacing rhythm.
- Fixed persistent Create initial offset by hardening app-shell route scroll reset behavior across pathname transitions, including window/document/container scroll resets and a follow-up `requestAnimationFrame` pass.
- Removed Lexical sync cursor placement (`root.selectEnd`) that could still trigger viewport jumps during Create hydration.

## 2026-03-04 — Nav scale bump + initial scroll/load offset fix (task-00168)
- Increased left-nav icon and label scale moderately for readability (icon render 15px -> 17px, icon slot 1rem -> 1.1rem, nav label size bumped) while keeping compact row density.
- Preserved task-00167 row-height invariants by keeping nav row hard-locked at `1.72rem` across expanded/collapsed/transition states.
- Fixed initial scrolled-down/top-cutoff load behavior by forcing top reset on shell route render and opting out of browser scroll restoration (`history.scrollRestoration = "manual"` + `scrollTo(0,0)`).
- Kept hover-expand + delayed auto-collapse sidebar behavior unchanged.

## 2026-03-04 — Left nav row-height hard fix across collapsed/expanded/transition states (task-00167)
- Eliminated nav row stretch behavior by switching `.rf-nav-list` from grid to vertical flex layout so extra sidebar height is not distributed across item rows.
- Locked `.rf-nav-item` to one fixed compact row height (`1.72rem`) with zero vertical padding growth and overflow constraints for consistent rhythm in expanded, collapsed, and transitioning states.
- Kept icon + label vertically centered with explicit flex centering and normalized line-height on the row/label.
- Preserved icon geometry and non-animated icon rendering while keeping collapse/expand animation scoped to label visibility only (`max-width` + `opacity`).

## 2026-03-04 — Left nav row-height + icon stability during collapse/expand (task-00166)
- Tightened left-nav item vertical rhythm (padding/line-height/gap/min-height) so rows are compact and only as tall as needed.
- Stabilized nav icon rendering with a fixed 1rem icon slot (.rf-nav-item-icon) and disabled icon-layer transform/opacity transitions to prevent flicker/disappearance.
- Kept icon x/y placement stable across collapse/expand by removing collapsed-state centering and animating only label reveal/collapse (max-width + opacity).
- Preserved existing hover-expand and delayed auto-collapse behavior while maintaining readable labels when expanded.

## 2026-03-04 — Nav logo asset swap + hover-driven compact nav refresh (task-00165)
- Replaced the left-nav Railfin logo asset with the newly provided image and trimmed transparent edge padding so the mark sits tighter.
- Switched nav behavior to collapsed-by-default hover interaction: sidebar expands on hover/focus and auto-collapses after ~2s when not hovered.
- Removed bottom nav minimize/maximize controls and related toggle UI.
- Added Lucide icons to nav items and reduced nav row vertical padding/height for a more compact menu.
- Kept logo rendering crisp and preserved responsive shell usability/alignment.

## 2026-03-04 — Left nav auto-minimize + width refinement (task-00164)
- Added left-nav auto-minimize with ~3s inactivity timeout when enabled, plus auto-expand on nav interaction.
- Added bottom nav controls for manual expand/collapse and an `Auto-minimize` toggle.
- Reduced default nav width, added collapsed rail behavior, and kept page content area layout stable.
- Moved Railfin name onto the same row as logo and kept responsive shell behavior coherent.

## 2026-03-04 — Main nav brand logo reduced by 25% (task-00163)
- Reduced the left-nav Railfin brand logo by 25% from task-00162 values (168px -> 126px on desktop) with proportional responsive scaling.
- Kept stacked brand alignment and sidebar navigation usability intact.
- Preserved responsive behavior across desktop and narrower breakpoints.

## 2026-03-04 — Main nav brand logo reduced by half (task-00162)
- Reduced the left-nav Railfin brand logo by ~50% from the task-00161 oversized state (336px -> 168px on desktop) with proportional responsive scaling.
- Rebalanced sidebar column widths to keep branding visually balanced while preserving clear, readable navigation.
- Kept stacked brand treatment and responsive behavior intact across desktop and narrower breakpoints.

## 2026-03-04 — Main nav brand logo tripled (task-00161)
- Increased the left-nav Railfin brand logo from 112px to 336px (~3x larger).
- Tuned brand spacing/typography so the wordmark remains present but visually de-emphasized beneath the oversized mark.
- Expanded desktop sidebar width with responsive fallbacks to preserve nav readability and interaction at narrower widths.

## 2026-03-04 — Main nav brand logo doubled again (task-00160)
- Increased the left-nav Railfin brand logo from 60px to 112px (roughly 2x larger again).
- Reworked the brand block to a stacked logo + wordmark treatment and reduced wordmark emphasis so the oversized mark remains clean and readable.
- Increased desktop sidebar width while keeping responsive fallback sizing so primary navigation remains usable across common desktop widths.

## 2026-03-04 — Main nav brand logo size increase (task-00159)
- Increased the left-nav Railfin brand logo in the app shell from 28px to 60px (at least 2x larger visually).
- Tuned brand row alignment so the Railfin wordmark remains readable and balanced beside the larger mark.
- Expanded desktop sidebar width and added responsive sizing fallback to keep nav spacing clean across screen sizes.

## 2026-03-04 — Create Generate/Lock action alignment across Topics + AI prompt (task-00158)
- Added **Generate Content** action to Topics mode and aligned Topics-mode action order to **Lock Prompt** then **Generate Content** under the selector area.
- Moved AI prompt mode action row under the AI Instructions textarea, matching Topics-mode placement/order.
- Unified both modes to the same generate entry pipeline so selected content type/topics/purposes continue feeding generation context.
- Preserved save/compliance/history/remediation behavior with no API contract changes.

## 2026-03-04

- Create page now places the four content-type buttons above the **Create content by** selector and adds toggleable **Topics**/**Purpose** controls in Topics mode.
- Added selectable Topics: **Tax Season 2026**, **AI and Jobs**, **Financial Wellness**.
- Added selectable Purposes: **Lead Outreach**, **Social Growth**, **Follower Growth**.
- Generation API requests now include selected `contentType`, `topics`, and `purposes`, and backend prompt scaffolding now incorporates those selections into model input.
- Backward-compatible default behavior preserved when no topic/purpose is selected.

## 2026-03-04 — Create input-mode selector + copy declutter (task-00156)
- Reworked Create generation controls to use a two-option content-creation method selector: **Select a few topics** or **AI prompt**.
- Implemented shared-container swap behavior between topics selection UI and prompt input UI.
- Removed copy clutter from Create: header fallback text (`Policy last updated: unavailable`), visible `Content Type` label, and the Save-stage reminder sentence.
- Removed the standalone tile around content-type controls and kept the four content-type buttons directly above prompt input in prompt mode.
- Preserved existing generate/save/compliance/remediation/history behavior while keeping styling consistent.

## 2026-03-03 — Lexical toolbar icon-only solid row (task-00154)
- Converted Create editor toolbar controls to icon-only buttons and preserved accessibility labels/pressed semantics.
- Removed spacing between toolbar controls/groups so the toolbar renders as one continuous neutral strip.
- Enforced single-row toolbar behavior with horizontal overflow on smaller widths (no wrapping).
- Kept active-state clarity and existing editor command behavior unchanged.
## 2026-03-03 — Lexical toolbar common options expansion (task-00153)
- Expanded Create editor toolbar with practical common controls: bold/italic/underline/strikethrough, H1/H2/H3/paragraph, bullet/numbered/check lists, blockquote/code block, link/unlink, alignment (left/center/right), undo/redo, and clear formatting.
- Preserved neutral grey toolbar styling and Lucide icon+label conventions while keeping active-state clarity and accessibility semantics.
- Added Lexical link/code support wiring (`@lexical/link`, `@lexical/code`, LinkPlugin + nodes`) without changing generation/save/compliance/remediation flows.

## 2026-03-03 — Lexical toolbar Lucide icon pass (task-00152)
- Replaced Create editor toolbar’s text/symbol formatting controls with Lucide icon + label buttons for clearer affordances.
- Kept the toolbar’s neutral grey, non-CTA visual style and preserved active-state clarity for formatting toggles.
- Preserved editor behavior/commands while improving control legibility and consistency.

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

## 2026-03-04 — Help Center landing + starter docs topics (task-00155)
- Added **Help Center** to primary app navigation for faster in-product support discovery.
- Added new Help Center landing page with a welcome hero, "How can we help?" prompt, search input UI placeholder, and topic-card grid.
- Added starter help topics for core workflows: Create onboarding, Save/Library flow, AI generation controls, compliance/remediation basics, and Configure/Change Log/Features guidance.
- Added two linked detail pages for immediate operator onboarding:
  - Getting started with Create
  - Compliance review and remediation basics

## 2026-03-04 — Events UI foundation phase 1 (task-00179)
- Replaced the Events placeholder with a functional landing experience that includes a prominent **Create Event** call-to-action and an empty-state-friendly Upcoming Events section.
- Added the first Event creation wizard step at `/app/events/new` with local form capture for title, date, summary, and location.
- Added local submit placeholder feedback for step 1 and intentionally deferred downstream messaging/email plumbing.
- Preserved existing app-shell navigation behavior and overall UI style contract.
