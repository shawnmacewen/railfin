## task-00175 — Left-nav icon remap (requested set) with fallback reference

- Updated app-shell primary nav icons in `src/ui/app-shell.tsx` to requested mapping while preserving existing size/stroke contracts (Lucide size `23`, strokeWidth `2`) so current nav visual balance, color classes, and no-jitter behavior remain intact.
- Applied mapping: **Create → Pickaxe**, **Library → BookOpenText**, **Campaigns → Goal (target-arrow SVG geometry)**, **Help Center → LifeBuoy**, **Configure → Settings**.
- Campaigns icon uses existing repo SVG source from Lucide Goal icon definition (`node_modules/lucide-react/dist/esm/icons/goal.js`), matching target+arrow treatment without introducing custom random assets.
- Preserved prior/default icon mapping as explicit fallback reference in code comments above `NAV_ITEMS` for quick revert/reference: Create=PenSquare, Library=FolderOpen, Campaigns=Target, Help Center=HelpCircle, Configure=Settings2.

## task-00174 — Double left-nav brand logo size with stable anchor

- Increased app-shell brand logo display size by exactly 2x at all existing breakpoints (`2.75rem -> 5.5rem`, `2.5rem -> 5rem`, `2.15rem -> 4.3rem`).
- Preserved the fixed logo anchor pattern (`.rf-brand-logo-wrap`) from task-00172 so collapse/expand keeps a stable horizontal logo position with no added jitter.
- Rebalanced brand block spacing for the larger mark (`.rf-brand` min-height and bottom spacing) to avoid crowding/overlap with nav items.
- Increased expanded sidebar track widths at desktop/tablet breakpoints to keep nav labels/items usable with the larger logo while preserving collapsed rail behavior and responsive shell layout.

## task-00173 — Remove duplicate in-page page-title headings under shell header

- Audited primary shell pages for duplicated page labels between top header (`<h1 class="rf-header-title">`) and in-content headings.
- Removed redundant visible in-content page titles for **Create**, **Library**, **Configure**, and **Events** surfaces while preserving layout rhythm.
- Updated Help hero to avoid repeating the nav page label as visible body text and retained the existing welcome headline.
- Preserved accessibility semantics by adding screen-reader-only section headings (` .rf-sr-only `) for page landmarks where visible titles were removed.
- Added small spacing modifiers (`rf-page-subtitle-standalone`, `rf-library-subtitle-standalone`) to keep visual balance after title removal.

## task-00172 — Lock nav logo horizontal anchor across collapse/expand

- Root cause: the brand row still allowed subtle x-axis drift because the logo lived directly in a content-width row where text reveal/hide and shrinking sidebar width could introduce small horizontal reflow.
- Updated `src/ui/app-shell.tsx` to wrap the logo in a dedicated fixed-width anchor container (`.rf-brand-logo-wrap`) so the logo x-position is constant in both collapsed and expanded states.
- Updated `src/app/globals.css` brand primitives to keep one alignment mode and box model across states (`display:flex`, `justify-content:flex-start`, `width:100%`) and pin the logo slot width at each responsive breakpoint.
- Preserved wordmark visibility behavior via `opacity` + `clip-path` only, with no positional alignment mode switching.
- Existing hover/focus expand + delayed auto-collapse nav behavior and row consistency contracts remain unchanged.

## task-00171 — Final nav jitter fix + app-shell SHA badge

- Root cause: the final micro-jitter came from collapse-state label width animation (`max-width`) and state-specific brand alignment changes (`justify-content` override), both of which triggered subtle reflow during sidebar width animation.
- `src/app/globals.css` now keeps nav row and brand container geometry stable across collapsed/expanded states and limits transition surfaces to non-positional properties (label/brand text `opacity` + `clip-path`).
- `src/app/globals.css` removes collapsed-state brand alignment override and keeps brand/logo anchors fixed while sidebar track width animates.
- `src/ui/app-shell.tsx` now renders an app-shell-level top-right build SHA badge (`.rf-build-sha-badge`) outside scrolling page content.
- `src/app/app/layout.tsx` resolves build SHA from env precedence (`NEXT_PUBLIC_APP_BUILD_SHA`, Vercel SHA vars, generic git SHA vars) with fallback `sha-unknown`, and normalizes hex SHAs to short 7-char display.
- Existing nav behavior (hover/focus expand + delayed auto-collapse), interactions, and responsive shell layout are preserved.

## task-00170 — Left-nav animation stability + size bump

- Root cause: collapse/expand state still changed row-adjacent box metrics (`.rf-nav-item` collapsed padding override + `.rf-nav-item-label` margin override), which introduced subtle layout reflow and visible micro-jitter while the sidebar track animated.
- Updated nav row contract in `src/app/globals.css` so expanded/collapsed states share identical row metrics (same fixed row height, padding, line-height, and icon slot geometry) and collapse animation remains label-only (`max-width` + `opacity`).
- Increased nav row container height by ~20% (`1.84rem -> 2.2rem`).
- Increased nav font size and icon size by ~20% (`1.13rem -> 1.36rem`, icon slot/SVG `1.2rem -> 1.44rem`) with lockstep icon render bump in `src/ui/app-shell.tsx` (Lucide `19 -> 23`).
- Preserved existing collapsed/expanded behavior and clean icon/label alignment while removing flow-affecting collapse-state metric drift.
## task-00169 — Left-nav visual pass 2 + Create initial scroll hard fix

- Updated `src/ui/app-shell.tsx` nav item definitions to raise icon render size (`17 -> 19`) and assign a unique class per nav icon for deterministic per-item color treatment.
- Updated `src/ui/primitives.tsx` `NavItem` primitive to accept optional `iconClassName` so icon color can be applied per route while preserving existing row structure and interactions.
- Updated `src/app/globals.css` nav primitives for a second visual bump and spacing polish: label size to `1.13rem`, icon slot to `1.2rem`, row height locked at `1.84rem`, and extra top/bottom nav-list padding for better vertical breathing room.
- Added per-route icon colors (`.rf-nav-icon-*`) with accessible contrast on white surfaces and retained active-row readability/hover behavior.
- Hardened shell scroll reset logic in `AppShell` to eliminate lingering Create initial offset: reset now runs on pathname transitions, resets window/document/shell container scroll positions, and repeats once on the next animation frame to avoid route transition race conditions.
- Updated `src/ui/lexical-editor.tsx` to remove sync-time `root.selectEnd()` cursor placement, preventing hydration-time editor selection from pulling viewport down on Create load.

## task-00168 — Left-nav scale refinement + initial scroll offset stabilization

- Updated `src/ui/app-shell.tsx` to moderately increase nav icon rendering size (Lucide `15 -> 17`) and retain existing hover/focus expand with delayed auto-collapse behavior.
- Updated `src/app/globals.css` nav primitives to raise visual size while preserving compact rhythm:
  - `.rf-nav-item` label size increased to `1.05rem`.
  - `.rf-nav-item-icon` slot increased from `1rem` to `1.1rem` (including SVG sizing).
  - row-height hard lock from task-00167 remains intact (`height/min-height/max-height: 1.72rem`).
- Added shell-level scroll normalization in `AppShell` so each route render lands at top-of-content consistently:
  - disables browser auto restoration (`window.history.scrollRestoration = "manual"`)
  - enforces explicit top reset (`window.scrollTo({ top: 0, left: 0, behavior: "auto" })`) on pathname change.

## task-00158 — Generate/Lock action alignment across Create input modes

- `src/ui/editor-shell.tsx` now renders a shared action pattern in both Create input modes:
  - **Topics mode:** Topics/Purpose selectors followed by action row (**Lock Prompt**, then **Generate Content**).
  - **AI prompt mode:** action row moved beneath the prompt textarea (same order and labels).
- Topics mode can now generate directly without switching modes by using a deterministic UI-composed prompt scaffold while preserving the same backend generation path.
- Both modes now execute the same `runGenerate` pipeline and preserve selected `contentType`, `topics[]`, and `purposes[]` context through existing generate requests.
- Existing Create save/compliance/history/remediation surfaces remain unchanged.

## task-00157 — Create topics/purpose toggles + generation payload wiring

- `src/ui/editor-shell.tsx` updates Create Generate controls so the four content-type buttons now render above the **Create content by** selector (applies to both Topics and AI Prompt modes).
- Added explicit Topics + Purpose toggle controls in Topics mode with clear on/off state (`aria-pressed` + active button styling):
  - Topics: `Tax Season 2026`, `AI and Jobs`, `Financial Wellness`
  - Purpose: `Lead Outreach`, `Social Growth`, `Follower Growth`
- Topics mode now presents a left-first Topics column with adjacent Purpose column and retains the existing prompt-mode generation flow.
- Generation request wiring now includes selected `contentType`, `topics[]`, and `purposes[]` on `/api/internal/content/generate` requests (single and package paths).
- Preserved non-breaking defaults: when no topics/purposes are selected, requests send empty arrays and backend prompt scaffold records `none selected`.

## task-00156 — Create input-mode UX refine + copy cleanup

- `src/ui/editor-shell.tsx` now uses a **content creation method selector** in the Generate stage:
  - **Select a few topics**
  - **AI prompt**
- The same control container now swaps content by selected method (topics UI vs prompt UI) instead of rendering a fixed single prompt section.
- Removed redundant copy/labels from Create:
  - removed top policy fallback phrase (`Policy last updated: unavailable`) from header area
  - removed visible `Content Type` label text
  - removed Save-stage helper sentence about review/remediation satisfaction
- Flattened content-type placement by removing the standalone content-type wrapper/tile and keeping the four content-type buttons directly above prompt input in AI prompt mode.
- Preserved existing behavior across generation, save, compliance, remediation actions, and generation history.

## task-00154 — Lexical toolbar icon-only solid row

- Updated `src/ui/lexical-editor.tsx` toolbar controls to icon-only rendering (no visible text labels) while retaining command wiring and `aria-label` accessibility semantics.
- Updated `src/app/globals.css` toolbar treatment to a contiguous, no-gap control strip with no wrapping; narrow viewports use horizontal scrolling instead of multi-line wrapping.
- Kept visual language neutral and preserved active-state clarity (non-CTA, subtle active contrast).
## task-00153 — Lexical toolbar common options expansion

- Expanded `src/ui/lexical-editor.tsx` toolbar coverage to practical common rich-text controls while preserving existing editor/data workflows:
  - Inline: Bold, Italic, Underline, Strikethrough
  - Blocks: H1/H2/H3, Paragraph, Blockquote, Code block
  - Structure: Bullet list, Numbered list, Checklist
  - Linking: Link + Unlink
  - Layout/history: Align Left/Center/Right + Undo/Redo
  - Cleanup: Clear formatting (resets inline styles/link/list/block/alignment to paragraph-left)
- Maintained neutral/grey toolbar visual language and Lucide icon+label affordances.
- Preserved accessibility semantics through role/group labels, per-button `aria-label`, toggle `aria-pressed`, and disabled-state handling for history commands.

## task-00152 — Lexical toolbar Lucide icon pass

- Updated `src/ui/lexical-editor.tsx` toolbar controls to use Lucide React icons with explicit text labels (Bold, Italic, Heading, Paragraph, Bullets, Numbered, Clear).
- Added reusable toolbar button rendering so icon+label controls keep the same command wiring and keyboard/click behavior.
- Preserved accessibility and active-state semantics via existing `aria-pressed` behavior for toggled formatting actions.
- Kept visual style neutral through additive toolbar polish in `src/app/globals.css` (grey bar, subtle active state, no blue CTA treatment).

## task-00149 — Lexical UX stabilization pass (post phase 1)

- `src/ui/lexical-editor.tsx` follows explicit Lexical React setup conventions:
  - `LexicalComposer`, `RichTextPlugin`, `ContentEditable`, `HistoryPlugin`, and `OnChangePlugin`.
  - toolbar active-state behavior uses a registered Lexical update listener for state synchronization.
- Toolbar style aligned to neutral demo approach:
  - grey top bar, grouped controls, icon+label feel, and non-CTA formatting buttons.
  - active formatting remains obvious without blue primary styling.
- `src/app/globals.css` improves split-layout editing comfort:
  - sticky desktop toolbar, bounded editor viewport with internal scroll.
  - mobile/smaller viewports fall back to normal page flow.
- `src/ui/editor-shell.tsx` adds Lexical-ready gating for prompt lock / generate / save controls.
- Intentional deviation: text+symbol button labels used instead of external SVG icon package to keep dependencies stable in this pass.

## task-00148 — Lexical phase 1 (Create workflow integration for AI + Compliance)

- Replaced Create page textarea editor with a Lexical-based rich text editor (`src/ui/lexical-editor.tsx`) and made it the primary authoring surface.
- Added practical baseline formatting controls in-editor: **bold**, **italic**, **heading**, **paragraph**, **bullet list**, **numbered list**.
- Wired AI Generate flow to hydrate Lexical reliably by converting generated plain text into editor HTML and syncing state back from Lexical on every change.
- Compliance now reads the current Lexical editor content via extracted plain text, preserving end-to-end compliance-check behavior.
- Save Draft now persists Lexical content as serialized HTML (`body`), and draft open/load hydrates that HTML back into Lexical.
- Library card previews now strip HTML tags from saved draft bodies so saved Lexical content remains readable in list/tile previews.
- Remediation apply/regenerate actions are intentionally deferred in this phase: controls remain visible but disabled with a clear temporary note to avoid broken paths while Generate+Compliance+Save flow is stabilized.

# UI Foundations

## task-00147 — Create single-content focus + prompt lock accordion + editor/compliance workspace upgrade

- `src/ui/editor-shell.tsx` refactors Create generation UX to be **single-content focused only**:
  - removed Mode selector from Create (no single/package toggle in this workflow).
  - generation action is colocated with prompt lock control and renamed to **Generate Content**.
- Prompt lock behavior now includes accordion minimization:
  - locking prompt sets the prompt field to read-only and collapses/minimizes the prompt input region.
  - collapsed prompt surface exposes an explicit expand control so users can reopen instructions without losing state.
- Editor workspace was expanded materially:
  - larger editor content working area (increased rows + larger min-height styling) for long-form editing and remediation workflows.
- Compliance panel now supports rail collapse:
  - right-side panel can collapse to a slim rail with always-visible maximize control at top.
  - expanded panel behavior remains sticky/persistent for ongoing compliance work.
- Added minimal in-editor rich-text tooling (no heavy package introduced in this pass):
  - toolbar actions for **bold**, **italic**, and **text color** insertion over selected text.
  - implemented as low-risk marker/tag wrapping in the existing editor textarea to avoid destabilizing save/remediation/compliance/history flows.
- Flow stability preserved (no endpoint contract changes): save draft, compliance run, remediation apply/undo/regenerate, and generation history restore continue to function.
- Package decision note (short-term vs long-term):
  - this task intentionally uses a lightweight toolbar strategy for risk control in the current release window.
  - recommended long-term option: migrate editor surface to a dedicated Next.js-friendly rich-text stack (preferred: Tiptap; alternatives: Lexical, Slate) once data model/storage policy for rich HTML vs markdown is finalized.

## task-00146 — Library tile layout and metadata refinement

- `src/ui/library-page.tsx` updates Library saved-item cards to a tile-oriented presentation while preserving existing Library → Create handoff behavior.
  - Each tile keeps the open/edit path via **Open in Create** linking to `/app/create?draftId=<id>`.
  - Created date label now has explicit prefix: `Created: <date>` (including safe fallback for invalid timestamps).
  - Added a dedicated **Description** label + preview area below date metadata for each tile.
- `src/app/globals.css` refines Library layout and tile proportions using additive `rf-library-*` styles:
  - responsive tile grid: 1 column (small), 2 columns (tablet), 4 columns (desktop).
  - square-leaning card proportions via minimum tile height and structured internal row layout.
  - description preview is line-clamped to 3 lines with ellipsis overflow handling for readable per-tile snippets.
- Existing Create loading/editing behavior from Library remains unchanged (query handoff via `draftId`).

## task-00145 — Create page UX polish follow-up

- `src/ui/editor-shell.tsx` refined Create controls per immediate product request:
  - removed the top workflow shortcut row (Generate/Review/Remediate/Save)
  - removed the explicit `1. Generate` stage label
  - kept **Campaign Package** mode visible but disabled/non-interactive (clear coming-soon affordance)
  - kept content-type choices as exactly four buttons on one horizontal row: Blog, Social Post, Article, Newsletter
- `src/app/globals.css` tightened platform shape language to a **2px radius baseline** across core controls/cards/pills to remove the over-rounded visual feel while staying within existing `rf-*` patterns.
- Existing generation, save, review, remediation, and compliance workflows remain intact (UX polish only, no contract change).

## task-00144 — Create page UX refactor (specific product-owner requests)

- `src/ui/editor-shell.tsx` updates Create generation ergonomics and wording per product-owner directives:
  - removed obsolete helper copy and redundant stage labels
  - moved draft save-state into a right-aligned header pill
  - replaced generation mode radios with two large active-state buttons
  - replaced content type dropdown with exactly four rectangular choices: Blog, Social Post, Article, Newsletter
  - split **AI Instructions** (prompt input) from **Editor Content** (output/editor area)
  - moved Generation History to the bottom of the Create page flow
- Added in-session prompt lock/reference behavior so users can retain the exact submitted prompt while reviewing generated output.
- `src/app/globals.css` adds additive `rf-*` styles for new pill + large choice-button controls.
- Roadmap follow-up explicitly documented: prompt submissions must be persisted with user linkage (user/session/model) in backend audit storage; current lock/reference behavior is UI-session scope only.


## task-00142 — Configure Features subpage

- Added a new Configure subpage at `/app/configure/features` and linked it in the Configure subnav between **Policy** and **Change Log**.
- Added a human-readable Features page that summarizes current app capabilities in plain language first, with short technical context where helpful.
- Coverage includes current workflow highlights across:
  - content generation and package mode
  - compliance checks and manual remediation controls (including undo)
  - draft save/library handoff and generation history restore/compare
  - Configure visibility surfaces (Policy, Features, Change Log)
- Styling is additive and consistent with existing Configure patterns using new `rf-feature-*` classes aligned to current `rf-configure-*` card rhythm.


## task-00139 — UX stabilization phase 2 (post split-layout)

- Refined Create’s split-layout ergonomics while preserving existing flows:
  - right compliance column now has stronger sticky/contained-scroll behavior to keep compliance tooling stable during long finding lists.
  - compliance run/status area remains visible while findings scroll, reducing repeated top-jumps.
- Reduced cognitive load in the left Create pane by progressively grouping generation controls into compact “Mode” and “Primary Output” control groups before action execution.
- Kept all existing capabilities intact (generate modes, history compare/copy/restore, review/remediation actions, save, compliance check) with no feature removals.
- Added targeted additive styling only (`rf-control-group`, `rf-create-primary-actions`, compliance panel scroll/sticky refinements) in `src/app/globals.css`.

## task-00136 — Create layout split (editor + persistent compliance panel)

- Reworked Create into a responsive split workspace in `src/ui/editor-shell.tsx`:
  - Desktop/tablet: two-column layout (~2fr editor workflow + ~1fr persistent compliance panel).
  - Mobile: stacked sections with a sticky workflow shortcut strip (Generate / Review / Remediate / Save).
- Kept existing behavior intact for generation, history restore/copy, save, review workbench actions, remediation apply/undo, and compliance execution; this is a layout/hierarchy pass, not a contract change.
- Added clearer stage framing in Create to emphasize operator flow: **1. Generate → 2. Review → 3. Remediate → 4. Save**.
- Added additive styling in `src/app/globals.css` (`rf-create-*`) for split layout, sticky compliance card, and mobile shortcuts.

## task-00135 — Configure Change Log subpage

- Added Configure section-level navigation with two tabs under `/app/configure`:
  - **Policy** → `/app/configure`
  - **Change Log** → `/app/configure/changelog`
- Added new Change Log page that renders human-readable release history from `docs/CHANGELOG.md`.
- Rendering behavior is intentionally lightweight and stable:
  - date sections use markdown `##` headings
  - release highlights use markdown bullet items
- Styling is additive and aligned with existing `rf-*` patterns:
  - `rf-configure-subnav*`, `rf-changelog-*`, shared `rf-page-*` heading rhythm.
- Existing shell navigation and Configure route behavior are preserved (no breaking route/contract changes).

## task-00133 — Package variant compare UX phase 1

- `src/ui/editor-shell.tsx` extends Create Generation History package entries with a side-by-side compare presentation for generated variants (email/linkedin/x-thread aligned package outputs) while preserving existing single-entry behavior.
- Added quick per-variant actions in compare cards:
  - **Copy** variant text directly to clipboard for fast reuse.
  - **Restore** variant into the editor with matching content type context (existing flow preserved).
- Existing Create safety/flow surfaces remain intact:
  - generation history retention/scoping unchanged
  - review workbench and remediation apply/undo interactions unchanged
  - save/generate/compliance contracts unchanged
- `src/app/globals.css` adds minimal `rf-*` compare grid/action refinements (no broad layout redesign).

## task-00130 — Campaign package UX phase 1

- `src/ui/editor-shell.tsx` extends Create generation controls with explicit mode selection:
  - **Single draft** mode keeps existing one-output generation behavior.
  - **Campaign package** mode generates a multi-channel set (Blog, LinkedIn, Newsletter, X Thread) from the same source prompt.
- Generation History now stores/restores outputs in a structured shape:
  - single generations are shown as one variant entry
  - package generations are grouped and rendered with per-variant metadata + restore actions
  - each variant can be restored directly into editor content with matching content-type context
- Existing flows are preserved (save, compliance, review workbench, remediation apply/undo); changes are additive and low-friction.
- `src/app/globals.css` adds compact `rf-*` styling for generation mode controls and package variant cards.

## task-00127 — Review workbench tidy pass 1

- `src/ui/editor-shell.tsx` reduces create-review clutter while preserving all remediation capabilities:
  - generation history panel spacing/header rhythm tightened for better scanability
  - review workbench now has clearer hierarchy via cardized sections and tighter spacing for selected-finding details/actions
  - selected-finding actions, protected-zone warning, and session apply history remain available with no contract/flow changes
- `src/app/globals.css` refines spacing/hierarchy for review workbench and generation history using existing `rf-*` conventions (no broad shell redesign).
- Existing create/save/generate/compliance/remediation behaviors are preserved; this is a targeted tidy pass ahead of broader UX cleanup.

## task-00124 — Auto-remediation UX phase 2

- `src/ui/editor-shell.tsx` now includes an explicit **Undo Last Apply** action in Review Workbench (manual, single-step rollback of the most recent remediation apply).
- Added protected/prohibited transform-zone warnings in Create remediation workflow when selected finding context suggests sensitive regions (legal/disclaimer, citation/attribution, compliance metadata).
- `src/ui/compliance-panel.tsx` now surfaces the same protected-zone warning at both finding-card level and selected-finding action panel for clearer operator visibility before apply actions.
- Preserved existing create/save/generate/compliance/history flows and endpoint contracts; changes remain additive and low-friction under existing `rf-*` style conventions.


## task-00121 — Auto-remediation UX phase 1

- `src/ui/editor-shell.tsx` now exposes a clearer manual-only auto-remediation affordance in Review Workbench:
  - explicit note that apply is manual and scoped to one selected finding
  - apply actions remain disabled unless a single finding context is selected
- Added stronger remediation status/preview feedback in Create flow:
  - explicit apply-in-progress/apply-error/apply-success review feedback messages
  - before/after remediation preview now includes bounded change summary (`changedChars`/`changedLines`) when returned by the API
- Preserved existing workflows and contracts:
  - generate/save/compliance/history paths unchanged
  - existing remediation apply history and apply+regenerate flow remain available
- Styling and naming remain aligned to existing `rf-*` conventions (no shell/layout redesign).

## task-00118 — Create generation history panel

- `src/ui/editor-shell.tsx` now tracks an in-session generation history (last MAX_GENERATION_HISTORY outputs) scoped to the current Create context (active draft when `draftId` is present, otherwise current new-draft session).
- Added a compact **Generation History** panel in Create that shows for each entry:
  - content type badge
  - runtime state badge (OK vs DEGRADED)
  - generated timestamp and provider hint (when available)
  - short preview snippet
- Added low-friction **Restore to Editor** action per history entry, which rehydrates the editor content and updates generation status feedback without changing save/generate/compliance API contracts.
- Existing behavior preserved:
  - save flow unchanged
  - generate request contract unchanged
  - compliance + review workbench interactions unchanged
- `src/app/globals.css` adds `rf-generation-history*` styles aligned with existing `rf-*` conventions.

## task-00114 — Content + review UX polish for live AI runtime

- `src/ui/editor-shell.tsx` now distinguishes generation outcomes using existing `generationMeta` metadata:
  - explicit successful runtime message when primary generation succeeds
  - explicit degraded fallback message when `generationMeta.degraded` is true
  - runtime/provider hint surfaced in review feedback for operator clarity
- `src/ui/compliance-panel.tsx` now reads compliance `meta` metadata and shows run-result state:
  - successful runtime completion status
  - degraded fallback completion status when `meta.degraded` is present
- `src/app/globals.css` includes shared `rf-status` variants (muted/success/error) to keep feedback low-friction and consistent with existing `rf-*` patterns.
- Existing workflows are preserved:
  - Create generate/save flow unchanged in request contracts
  - Compliance check and review workbench actions preserved
  - Library→Create draft-open behavior unaffected

## task-00111 — Review workbench phase 6 (apply + regenerate)

- `src/ui/editor-shell.tsx` adds a quick selected-finding workflow in Review Workbench:
  - **Apply Selected Context** to stage remediation context directly from currently selected compliance finding
  - **Apply + Regenerate Draft** to apply selected remediation context and immediately run draft generation in one action
- Generation flow in `EditorShell` now uses a shared helper so standard Generate and apply+regenerate both preserve existing request contracts (`POST /api/internal/content/generate` with `{ prompt, contentType }`).
- Existing behavior remains preserved:
  - save flow/status feedback unchanged
  - compliance check flow/disclaimer unchanged
  - selected-finding/context/history behavior remains low-friction and additive
- `src/app/globals.css` adds compact `rf-review-workbench-actions` styles aligned with existing `rf-*` UI patterns.

## Login

Implemented MVP login action wiring in `src/ui/login.tsx` with the following behavior:

- Submit handler posts to `/auth/login` with JSON payload containing:
  - `email`
  - `password`
  - optional `next` when present in the URL query
- Request is sent with `credentials: include` and `X-Requested-With: XMLHttpRequest` for SEC middleware compatibility.
- Form enters a `submitting` state during request lifecycle:
  - fields and submit button are disabled while pending
  - submit button label changes to `Signing in...`
  - `aria-busy` is set on form
- Error behavior:
  - displays response `error` / `message` inline via `role="alert"`
  - falls back to a generic sign-in error if request fails
- Success behavior:
  - redirect priority: `payload.redirectTo` → safe `next` value → `/`
  - `next` is sanitized to internal paths only (`/...`) before use

### Guard Contract Notes

- `/login?next=...` remains middleware-compatible: client forwards `next` only when present and only if it is an internal path (`/` prefix), otherwise it falls back to `/`.

## Compliance Panel (MVP + AI insights UX)

- `src/ui/compliance-panel.tsx` wires the `Run Compliance Check` action to `POST /api/internal/compliance/check` with editor-backed request payload (`content`, optional `contentType`, optional `policySet`).
- Existing loading/error flow is preserved (`Running Compliance Check...`, inline `role="alert"` on failure).
- Findings are now grouped by normalized severity (`critical`, `high`, `medium`, `low`, `unknown`) and rendered as grouped cards.
- Severity is surfaced with clear visual badges (`.rf-severity-badge` variants) for fast scan/readability.
- Each finding includes a concise **Remediation Hint** (trimmed from `suggestion` with safe fallback guidance).
- UI includes explicit compliance disclaimer: **"AI-backed compliance insights are guidance, not legal approval."**
- No shell/layout redesign: app shell and existing editor flow remain intact.

## Editor Integration Note

- `src/ui/editor-shell.tsx` now composes the main editor flow and mounts `<CompliancePanel />` directly below editor save controls.
- Editor UX exposes visible action/feedback states: save button disabled logic, pending label (`Saving...`), success status, and inline validation/error feedback.

## Click Path (Preview Walkthrough)

- Open `/preview/login`
  - Enter email/password and click **Sign in** to validate login form submit/loading/error behavior.
- Open `/preview/editor`
  - Enter text in **Editor Content** and click **Save Draft** to exercise draft save controls + save feedback.
  - Click **Run Compliance Check** to view compliance panel behavior and findings render area.

## App Shell Foundation (task-00040)

### Shell structure

- `src/app/app/layout.tsx` mounts a reusable `<AppShell>` for all `/app/*` routes.
- `src/ui/app-shell.tsx` defines the shared two-column shell:
  - persistent left sidebar nav
  - top header with active page title and placeholders
  - main content slot for route content
- `src/app/globals.css` includes minimal structural classes (`rf-shell`, `rf-sidebar`, `rf-header`, `rf-content`) and primitive styling.

### Navigation contract

- Primary nav is fixed and ordered as:
  1. `Create` → `/app/create`
  2. `Library` → `/app/library`
  3. `Campaigns` → `/app/campaigns`
  4. `Configure` → `/app/configure`
- Active state is pathname-driven (`exact` or nested path prefix).
- `/app` redirects to `/app/create`.
- Legacy `/app/editor` now redirects to `/app/create` so existing editor/compliance flow remains reachable under the new Create nav item.

### Header contract

- Left: active nav label as page title.
- Right placeholders:
  - environment badge placeholder (`Env`)
  - user-menu placeholder (`User`, disabled button)

### Primitive wrappers

- Added in `src/ui/primitives.tsx`:
  - `Button`
  - `Card`
  - `Badge`
  - `NavItem`
- These are intentionally thin wrappers for consistency and future token/theme expansion without introducing a redesign.

## Branding (task-00046)

- Railfin v1 brand asset is stored at `public/brand/railfin-v1.png`.
- App favicon/icon is provided via `src/app/icon.png` (Next app-router icon file convention).
- Shell top-left branding in `src/ui/app-shell.tsx` now renders the Railfin logo + wordmark linking to `/app/create`.
- Supporting minimal shell brand styles are in `src/app/globals.css` (`.rf-brand`, `.rf-brand-logo`).
- **task-00159 update:** increased shell brand logo visual size to 60px (>=2x prior 28px), added `.rf-brand-text` line-height tuning, and widened desktop sidebar track with responsive fallback to maintain clean nav spacing/alignment.
- **task-00160 update:** doubled the shell brand mark again to 112px, shifted brand layout to stacked logo + wordmark with reduced text prominence, and further widened desktop sidebar track to preserve usable nav spacing at common desktop widths.
- **task-00161 update:** tripled the shell brand mark from 112px to 336px, kept the wordmark present but de-emphasized, and retuned sidebar track + responsive logo sizing to keep navigation usable without overlap.
- **task-00162 update:** reduced the shell brand mark by ~50% from the task-00161 oversized state (336px to 168px on desktop), tightened sidebar track sizing for better brand/nav balance, and preserved responsive logo scaling at narrower breakpoints.
- **task-00163 update:** reduced the shell brand mark by 25% from task-00162 sizing (168px to 126px on desktop) with proportional responsive fallbacks, while preserving stacked brand alignment and sidebar nav usability.
- **task-00164 update:** added left-nav auto-minimize (~3s inactivity) with bottom controls for manual expand/collapse + auto-minimize toggle, reduced default sidebar width, introduced collapsed-rail layout, and moved Railfin wordmark onto the same row as the logo while preserving responsive shell/content behavior.
- **task-00166 update:** tightened nav row density (padding/line-height/gap/min-height), stabilized icon slot geometry (1rem fixed icon container) with no icon-layer transform/opacity transition, and moved collapse animation responsibility to nav labels (max-width + opacity) so icons stay fixed with no collapse/expand flicker while hover-expand + delayed auto-collapse behavior remains intact.
- **task-00167 update:** hard-fixed left-nav row consistency by replacing stretch-prone grid list layout with a non-stretch vertical flex stack, locking nav rows to a single fixed compact height (`1.72rem`) across expanded/collapsed/transitioning states, and keeping icon geometry stable while restricting collapse/expand animation to label visibility only.

## Hosted Smoke UX Verification Rerun (task-00056)

Rerun completed after hosted path repair, verifying current route/component contracts without layout redesign.

- Verified route/component wiring:
  - `/login` and `/preview/login` render `LoginForm`
  - `/app/create` and `/preview/editor` render `EditorShell` (which mounts `CompliancePanel`)
- Re-verified login UX assumptions (`src/ui/login.tsx` + `src/app/auth/login/route.ts`):
  - submit/loading/error states present
  - internal-only `next` handling retained
  - redirect contract remains `payload.redirectTo -> safe next -> /`
- Re-verified create/save UX assumptions (`src/ui/editor-shell.tsx`):
  - save disabled for empty content
  - explicit saving/success/error feedback remains intact
- Re-verified compliance UX assumptions (`src/ui/compliance-panel.tsx`):
  - action loading/error states present
  - findings grouped by severity and rendered as cards
  - legal disclaimer rendering present: **"AI-backed compliance insights are guidance, not legal approval."**
- Confirmed provider/fallback behavior (`src/app/api/internal/compliance/check/route.ts`):
  - provider chain remains Codex-first with ChatGPT API fallback
  - safe fallback finding is returned when providers fail/time out

## task-00093 — Review tools kickoff in Create flow

- `src/ui/compliance-panel.tsx` now includes a first review-tools layer on top of existing compliance findings:
  - findings summary card with total + per-severity counts (`critical`, `high`, `medium`, `low`, `unknown`)
  - per-finding quick actions for remediation workflow (`Apply Hint`, `Remind Later`)
- `src/ui/editor-shell.tsx` now wires review quick actions without changing API contracts.
- Existing guardrail/disclaimer messaging is preserved unchanged:
  - **"AI-backed compliance insights are guidance, not legal approval."**
- Existing save, generate, and compliance-check flows are preserved:
  - no endpoint contract changes
  - no route/layout redesign
  - review actions are additive UI affordances only
- Styling stays within existing railfin-ui patterns and primitives (`rf-status`, severity badges, card-like sections).

## task-00102 — Review workbench phase 4

- `src/ui/editor-shell.tsx` now includes a compact **Review Workbench** section in Create that surfaces:
  - the currently selected finding context (issue, severity, location, remediation hint)
  - current-session remediation apply history (latest entries)
- `src/ui/compliance-panel.tsx` now emits selected-finding context to parent editor state via `onSelectedFindingChange`, keeping selection UX and existing action controls intact.
- `src/app/globals.css` adds compact `rf-review-workbench*` styles consistent with existing railfin `rf-*` conventions.
- Preserved behavior constraints:
  - no generation/save/compliance API contract changes
  - existing compliance disclaimer, status messaging, and remediation apply flow retained

## task-00099 — Review tools UX phase 3

- `src/ui/editor-shell.tsx` now provides clearer remediation apply context with an **Applied Remediation Context** panel:
  - captures previous remediation block (if present) and the newly applied block
  - shows side-by-side before/after context to reduce ambiguity while revising
  - preserves controlled remediation block replacement behavior (`[Compliance Remediation Draft Context] ...`)
- `src/ui/compliance-panel.tsx` keeps selection and action handling obvious and low-friction:
  - selected-finding action controls remain centralized and persist in the summary panel
  - action controls (`Apply Selected`, `Remind Later`, `Clear Selection`) are always visible and explicitly disabled until a finding is selected
  - selected context includes issue/severity/remediation/location details
- Styling updates in `src/app/globals.css` remain aligned with existing railfin patterns (`rf-*` classes), including stronger selected-action panel prominence and remediation preview card styling.
- Preserved behavior constraints:
  - no generation/save/compliance contract changes
  - existing status + legal-disclaimer messaging retained

## task-00096 — Review tools UX phase 2

- `src/ui/compliance-panel.tsx` now presents severity totals as compact summary chips for faster scan/readability (`critical`, `high`, `medium`, `low`, `unknown`).
- Added a dedicated **Selected Finding Actions** panel in the summary area:
  - shows selected finding issue/remediation/location context
  - centralizes `Apply Selected` / `Remind Later` actions for clearer decision flow
  - provides explicit empty-state guidance until a finding is selected
- Finding cards remain grouped by severity and keep explicit selection affordance (`Select Finding`) with selected-card highlighting.
- Preserved behavior constraints:
  - existing save/generate/compliance request paths unchanged
  - existing status/disclaimer messaging retained
  - no API contract or endpoint shape changes

## task-00094 — Review tools actions phase 1

- `src/ui/compliance-panel.tsx` extends review actions with explicit finding selection:
  - each finding card now includes `Select Hint`
  - selected-card state is visually highlighted and gates downstream actions
  - remediation actions are now explicit (`Apply Selected`, `Remind Later`) and only enabled for the selected finding
- `src/ui/editor-shell.tsx` applies selected remediation hints into a controlled, editable draft context block:
  - inserts a bounded `[Compliance Remediation Draft Context] ... [/Compliance Remediation Draft Context]` block
  - includes issue/severity/location + selected remediation hint
  - replaces prior remediation block when reapplying, avoiding unbounded repeated append noise
- Preserved behavior constraints:
  - existing save/generate/compliance request paths unchanged
  - existing status messaging/disclaimer retained
  - no API contract changes

## task-00092 — Create generation kickoff (AI runtime wired)

- `src/ui/editor-shell.tsx` now wires a **Generate Draft** action to `POST /api/internal/content/generate`.
- Create UI sends `{ prompt: content, contentType }` with a selectable content type (`blog`, `linkedin`, `newsletter`, `x-thread`).
- Generation flow adds explicit UX states without changing save/compliance behavior:
  - `generating` pending state
  - generated success message from `generationMeta.notes`
  - inline error state on generation failure
- On success, generated `draft.text` hydrates editor content in-place so existing save/compliance flows continue unchanged.
- Existing compliance guardrail language remains intact in the compliance panel: **"AI-backed compliance insights are guidance, not legal approval."**

## Library UX behavior (task-00063)

- `src/app/app/library/page.tsx` now renders a usable library UI (`LibraryPageContent`) instead of placeholder copy.
- `src/ui/library-page.tsx` behavior:
  - fetches drafts from `GET /api/internal/content/list`
  - includes search input (`type="search"`) and refetches when query changes
  - shows explicit **loading**, **error**, and **empty** states
  - renders draft list cards (title, created timestamp, body excerpt) on success
- Empty-state copy distinguishes between:
  - no drafts at all
  - no search matches for current query
- Styling for list/card presentation is added in `src/app/globals.css` under `rf-library-*` classes.

## Configure UX behavior (task-00065)

- `src/app/app/configure/page.tsx` now renders `ConfigurePageContent` from `src/ui/configure-page.tsx` instead of placeholder text.
- Configure screen includes:
  - provider status placeholders for **Codex (Primary)** and **Fallback Provider**
  - free-text **Policy guidance** textarea for operator-entered policy instructions
  - Save/Cancel action row with dirty-state guards (`disabled` unless changes exist)
- Save/Cancel UX state contract:
  - Save enters `saving` state (`Saving...`, `aria-busy`) and ends with success/error feedback message
  - Cancel restores last saved policy text and shows discard feedback
  - No-op save attempt (no dirty changes) returns explicit `No changes to save.` feedback
- Styling follows existing app-shell design-system conventions using existing primitives (`Card`, `Button`, `Badge`) plus scoped `rf-configure-*` classes in `src/app/globals.css`.

## Library → Create handoff (task-00069)

- Library rows now include **Open in Create** action linking to `/app/create?draftId=<id>`.
- Create editor (`src/ui/editor-shell.tsx`) reads `draftId` from query params and fetches `GET /api/internal/content/draft?id=<id>`.
- On successful load, editor content hydrates with the selected draft body and surfaces status text (`Opened draft: <title>`).
- Existing editor save/compliance behavior remains intact (same save button states and compliance panel composition).

## Configure → Create UX integration polish (task-00072)

- Create flow (`src/ui/editor-shell.tsx`) now surfaces a persistent save-state line above the editor form:
  - `Draft save status: Not saved yet.`
  - `Draft save status: Saving…`
  - `Draft save status: Saved.`
  - `Draft save status: Save failed.`
- Create flow also reads configure policy metadata from `GET /api/internal/configure/policy` and shows:
  - `Policy last updated: <localized timestamp>` when `updatedAt` is available
  - `Policy last updated: unavailable` when metadata is missing/unreachable
- Integration constraints preserved:
  - Compliance panel remains mounted in Create flow (`<CompliancePanel />` unchanged)
  - Library handoff via `draftId` query parameter remains the same and still hydrates editor body/title

## Active policy context in compliance area (task-00075)

- Compliance area now shows a concise policy-context line directly above the compliance disclaimer:
  - `Active policy context: Configure policy updated <localized timestamp>.`
  - fallback: `Active policy context: No configure policy metadata available.`
- The context line is sourced from the same configure-policy metadata already loaded in Create flow (`GET /api/internal/configure/policy`), avoiding additional endpoint calls.
- Existing behavior is preserved:
  - Compliance run action and findings rendering are unchanged.
  - Library→Create handoff (`draftId` query load) remains unchanged.

## RC1 visual consistency pass (task-00078)

- Scope: light consistency pass only (no functional or route contract changes).
- Shared page-heading treatment across Create/Library/Configure now uses:
  - `.rf-page-header`
  - `.rf-page-title`
  - `.rf-page-subtitle`
- Shared status/feedback treatment across the same views now uses:
  - `.rf-status`
  - `.rf-status-muted`
  - `.rf-status-success`
  - `.rf-status-error`
- RC1 constraints:
  - Preserve existing behavior for Library→Create handoff (`draftId`), Configure save/cancel flow, and compliance run/findings flow.
  - Keep changes lightweight and visual-consistency-focused (spacing, header rhythm, status presentation).

## Create save-draft API wiring restored (task-00082)

- `src/ui/editor-shell.tsx` Save Draft action now performs a real `POST /api/internal/content/draft` call instead of mock timeout success.
- Request payload includes:
  - `body` (full editor content)
  - `title` (existing loaded draft title when present, otherwise derived from first content line with safe fallback `Untitled Draft`)
- Save UX semantics remain intact:
  - existing status line cycle (`saving` / `saved` / `error`)
  - save button disable behavior remains tied to content + in-flight state
- Save feedback now reports backend draft hints when available (`title` and `id`) and surfaces API error details from `fieldErrors`/`error` when save fails.
- Existing Create behaviors were preserved:
  - `draftId` query hydration/load path
  - configure policy metadata indicator used by Create/compliance context

## task-00155 — Help Center landing + starter help topics

- Added new primary nav item **Help Center** in `src/ui/app-shell.tsx` pointing to `/app/help`.
- Added Help Center landing route `src/app/app/help/page.tsx` with:
  - welcome hero/header section
  - non-functional search input UI placeholder (`type=search`, disabled)
  - starter topic-card grid aligned with existing `rf-*` card/layout patterns
- Added starter topics mapped to current product surfaces:
  - Getting started (Create flow)
  - Saving and Library
  - AI generation controls
  - Compliance review + remediation basics
  - Configure + Change Log + Features pages
- Added two detail pages linked from topic cards:
  - `/app/help/getting-started`
  - `/app/help/compliance-basics`
- Added top-level shortcut route `src/app/help/page.tsx` redirecting to `/app/help`.
- Added additive help styles in `src/app/globals.css` under `rf-help-*` classes (no shell redesign).
