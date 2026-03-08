## 2026-03-08 07:55 UTC — task-00204 Create compliance rail overlap + divider cleanup
- Refactored Create compliance rail controls in `src/ui/editor-shell.tsx` to eliminate overlap risk from floating minimize/reopen UI.
- Minimized state now uses an in-flow reopen button (`⇤ Open Compliance`) within the compliance column, preventing overlap with Create editor controls/content.
- Expanded state now keeps minimize control inside the compliance card header and uses a wider arrow+label affordance (`⇥ Minimize Panel`).
- Removed the blue vertical middle rail by deleting the separate rail control column/styles in `src/app/globals.css`; separation now comes from layout/card spacing.
- Preserved task-00203 cache behavior by keeping compliance panel mounted while collapsed (`hidden`) so findings/run state persists across toggle.
- Updated docs (`docs/tasks.md`, `docs/CHANGELOG.md`, `docs/UI_FOUNDATIONS.md`) and verified `npm run build` passes.

## 2026-03-08 07:43 UTC — task-00203 Create compliance results local cache
- Implemented local compliance-result persistence for Create session in `src/ui/compliance-panel.tsx` + `src/ui/editor-shell.tsx`.
- Compliance panel now stays mounted while collapsed (`hidden` instead of unmount), so minimizing/reopening does not clear findings or run summary.
- Added stale-state detection based on content/policy signature at run time, with explicit warning text when content changed after last check while preserving old findings for operator reference.
- Added save-path invalidation by wiring `complianceResetToken` in `EditorShell` and passing `resetToken` to `CompliancePanel`; successful save clears cached compliance results.
- Preserved manual run model and existing compliance API/UX rendering behavior (no auto-rerun on panel toggle).
- Updated docs/tasks/changelog/UI foundations + lane report and verified `npm run build` passes.

## 2026-03-08 07:25 UTC — task-00201 Create unsaved warning + compliance cleanup
- Added unsaved-navigation guard across app-shell route changes from Create: when meaningful unsaved generated/edited content exists, nav attempts open a clear two-choice modal (**Stay on Create** / **Leave Without Saving**).
- Guard wiring implemented via Create unsaved-state event emission in `src/ui/editor-shell.tsx` and app-shell listener/interceptor in `src/ui/app-shell.tsx`; includes browser `beforeunload` prompt for refresh/close while dirty.
- Unsaved-warning trigger is intentionally conservative to reduce noise: compares normalized current content against saved/opened baseline and requires meaningful-content threshold before warning.
- Compliance panel cleanup in `src/ui/compliance-panel.tsx` + `src/app/globals.css`: reduced visual weight, removed sticky/pinned top behavior, made success status more discreet, and removed Selected Finding Actions summary section.
- Preserved compliance run + findings rendering + remediation affordances by keeping per-finding selection/actions (`Select Finding`, `Apply Hint`, `Remind Later`).
- Updated docs (`docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`) and reran build.

## 2026-03-08 07:20 UTC — task-00200 CRM Add New Lead modal flow
- Converted CRM create-lead interaction in `src/app/app/crm/page.tsx` from inline panel to modal dialog opened by toolbar **Add New Lead**.
- Kept page body table-first/list-first so lead data remains primary visual focus.
- Added modal close pathways: top-right close button, Cancel action, backdrop click, and Escape key support.
- Preserved create validation + API wiring and in-modal error feedback; on success: reset form, refresh list, close modal, and show page-level success status.
- Added dialog accessibility + focus behavior (`role="dialog"`, `aria-modal`, `aria-labelledby`, open focus to first field, return focus to trigger, tab-loop containment) and responsive modal styles in `src/app/globals.css`.
- Updated docs (`docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`) and reran build.

## 2026-03-08 07:05 UTC — task-00199 tightened expanded left-nav width
- Reduced expanded sidebar width values in `src/app/globals.css` to cut right-side whitespace while preserving nav readability:
  - default `minmax(14rem, 15rem) -> minmax(12.75rem, 13.5rem)`
  - `@media (max-width: 1200px)`: `13rem -> 12.25rem`
  - `@media (max-width: 860px)`: `12rem -> 11.5rem`
- Left collapsed rail width (`4.5rem`), nav icon size/slot (`23` render, `1.44rem` slot), row height, and label reveal/hide transitions unchanged to preserve hover-expand + anti-jitter behavior.
- Mobile/off-canvas behavior unchanged (`<=900px` drawer and backdrop/menu interactions retained).
- Updated docs (`docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`) and reran build.

## 2026-03-08 06:55 UTC — task-00198 toolbar tooltip + compliance collapse rerun
- Confirmed work executed in canonical repo context (`/work/railfin`) and reimplemented task-00198 fixes.
- Added delayed Lexical toolbar tooltips in `src/ui/lexical-editor.tsx` with keyboard-accessible labels/ARIA (`title`, `aria-describedby`, `role="tooltip"`), ~500ms show delay, and delayed dismiss behavior.
- Updated Create compliance behavior in `src/ui/editor-shell.tsx` + `src/app/globals.css`:
  - defaults minimized on page load
  - collapsed state slides panel out right and disables pointer capture
  - main Create editor area expands to full width when compliance is collapsed
  - added clear reopen control while collapsed
  - removed sticky side behavior to avoid lingering hover footprint
- Updated docs (`docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`) and reran build.

## 2026-03-07 04:20 UTC — task-00197 Configure Features list refresh
- Updated `/app/configure/features` content to reflect current shipped capabilities in operator-friendly language.
- Re-grouped feature bullets around: Create/Lexical editing, compliance/remediation controls, CRM + Events operations, and nav/support visibility.
- Added explicit in-progress note: outbound event email plumbing remains deferred to a later phase.
- Updated `docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, and `docs/CHANGELOG.md`; build passed (`npm run build`).

## 2026-03-07 04:00 UTC — task-00196 Create mobile responsiveness + nav label fix
- Root cause 1 (mobile nav labels): collapsed-state selector hid nav labels/brand text even when mobile off-canvas menu was open, causing blank labels while expanded.
- Root cause 2 (Create phone layout): several Create controls/summaries/header/history sections remained row-oriented at narrow widths, creating crowding/overflow pressure on phones.
- Fixes shipped in `src/app/globals.css`:
  - collapse-label hide now excludes mobile-open state (`:not(.is-mobile-nav-open)`) so expanded mobile nav labels stay visible
  - phone breakpoint Create refinements: stacked page header + collapsed summaries + history header; full-width reopen/status controls; single-column generate-mode buttons; 2-up shortcuts; stronger overflow wrapping; tighter compliance card padding
- Stability: preserved existing nav row-height/jitter fixes and desktop behavior.
- Docs updated: `docs/UI_FOUNDATIONS.md`, `docs/tasks.md`, `docs/CHANGELOG.md`, `docs/agent-reports/railfin-ui.md`.
- Build verification: `npm run build` passed.

## 2026-03-07 04:35 UTC — task-00195 responsive design pass
- Completed a broad responsive pass across Create, Library, Campaigns, Events, CRM, Configure (+ subpages), Help Center, and shell-level navigation behavior.
- Added small-screen app-shell off-canvas nav mode with header Menu/Close control and dismissible backdrop to keep content unobstructed.
- Added shared breakpoint refinements for spacing/control stacking/header wrapping and button reachability on mobile/tablet.
- Added CRM mobile card fallback while preserving desktop/tablet table-first behavior with horizontal scroll support.
- Updated docs/UI_FOUNDATIONS.md, docs/tasks.md, docs/CHANGELOG.md, and this lane report; build passed.

## task-00194 — UI — CRM inline Add New Lead control above leads table

- Status: **Done**
- Branch: `feat/ui/task-00194-crm-add-button-inline`
- Scope delivered:
  - Removed standalone new-lead section/card framing from CRM.
  - Moved **Add New Lead** into compact toolbar position above leads table and kept table as primary visual focus.
  - Preserved create form validation/API flow by revealing form inline under toolbar button.
  - Preserved search + table filtering behavior.
  - Build verification: `npm run build` passed.

- 2026-03-07 01:46 UTC task-00194: simplified CRM to table-first layout with compact inline Add New Lead toolbar control, removed separate standalone new-lead section framing, preserved create/search/table behaviors, updated docs/tasks/changelog/lane report, and build passed.

## task-00193 — UI/DEV — Nav font adjustment + CRM leads-first table refactor

- Status: **Done**
- Branch: `feat/ui/task-00193-nav-font-and-crm-table-refactor`
- Scope delivered:
  - Reduced left-nav label font size (`1.2rem -> 1.13rem`) while preserving icon sizing and row-height stability.
  - Refactored CRM default view to a clean leads-first table with larger tabular layout.
  - Added client-side searchable leads behavior (name/email/source/status).
  - Moved New Lead form behind compact **Add New Lead** open/close toggle (hidden by default).
  - Preserved existing create/list/validation behavior.
  - Build verification: `npm run build` passed.

- 2026-03-07 01:39 UTC task-00193: trimmed left-nav label typography without icon/row metric changes; reorganized CRM into table-first searchable grid; moved create form to on-demand Add New Lead toggle; kept API create/list validation behavior intact; updated docs/tasks/changelog/lane report; and build passed.

## task-00192 — UI — Left-nav label font down + icon palette refinement

- Status: **Done**
- Branch: `feat/ui/task-00192-nav-font-down-icon-palette`
- Scope delivered:
  - Reduced nav label size from `1.36rem` to `1.2rem` while preserving icon render size and slot dimensions.
  - Added explicit per-item nav icon class wiring (including CRM) and remapped icon colors to Railfin brand-family tones from teal/blue/orange palette.
  - Added dark-scheme icon tint overrides to maintain readability on dark surfaces.
  - Kept row-height and collapse/expand alignment stability fixes intact (no jitter-related geometry changes).
  - Build verification: `npm run build` passed.

- 2026-03-06 04:44 UTC task-00192: reduced left-nav label typography size (icons unchanged), applied class-based per-item icon colors using brand palette derivatives (teal/blue/orange family) with dark-mode tints, preserved nav row/collapse jitter fixes, updated UI docs/tasks/changelog/lane report, and build passed.

## task-00190 — UI/DEV — Lexical editor functionality sweep + stabilization

- Status: **Done**
- Branch: `fix/ui/task-00190-lexical-functionality-sweep`
- Scope delivered:
  - Completed button-by-button Lexical toolbar functionality and active-state audit; fixed inert/stuck behaviors in list/link/block/alignment state handling.
  - Removed default-on active states when selection is absent and improved live state updates for true selection context.
  - Stabilized typing/delete/backspace behavior by reducing selection-change churn in onChange sync and making selection listener reads editor-state safe.
  - Preserved toolbar visual style (icon-only, contiguous solid row) while improving command reliability.
  - Added a concise Lexical QA checklist to UI foundations docs.
  - Build verification: `npm run build` passed.

- 2026-03-06 04:13 UTC task-00190: shipped Lexical toolbar functionality sweep + typing stability hardening (selection-state fixes, no default-stuck actives, alignment/code/strike persistence in contract, selection-change sync churn reduction), updated docs/tasks/changelog/UI foundations, and build passed.

## task-00189 — UI — Auto-collapse Create input panel after successful generate

- Status: **Done**
- Branch: `feat/ui/task-00189-auto-collapse-input-panel-after-generate`
- Scope delivered:
  - Added post-success auto-collapse behavior for Create input controls in both Topics and AI Prompt modes.
  - Added compact **Edit inputs** reopen control in collapsed state and preserved selected mode + existing field values on re-open.
  - Scoped collapse trigger to successful generate completion only (no collapse on generate errors).
  - Preserved generate/save/compliance/remediation/history flows.
  - Build verification: `npm run build` passed.

- 2026-03-06 04:09 UTC task-00189: shipped Create input auto-collapse after successful generation for both Topics and AI Prompt modes with compact Edit inputs reopen control; preserved mode/field state on reopen; updated UI docs/tasks/changelog; and build passed.

## task-00188 — UI/DEV — Lexical Create editor typing/input hotfix

- Status: **Done**
- Branch: `fix/ui/task-00188-lexical-editor-typing-bug`
- Scope delivered:
  - Root-caused typing instability to Lexical sync-loop behavior that re-applied HTML into the editor during active typing.
  - Added last-known HTML tracking across editor onChange + sync plugin to avoid unnecessary DOM re-import/reset cycles.
  - Updated change extraction to use editor-state read path and preserved toolbar focus/selection behavior.
  - Build verification: `npm run build` passed.

## task-00187 — UI — CRM basic lead tracking space phase 1

- Status: **Done**
- Branch: `feat/dev/task-00187-crm-basic-space-phase1`
- Scope delivered:
  - Added **CRM** to primary nav and routed to `/app/crm`.
  - Added CRM landing UI with create-lead form and lead list states (loading/error/empty/success).
  - Added `/crm` shortcut redirect to `/app/crm`.
  - Kept UI scope intentionally basic with no automation/outbound actions.
  - Build verification: `npm run build` passed.

- 2026-03-04 16:50 UTC task-00185: wired `/app/events` to live `GET /api/internal/events` with loading/empty/error+retry states, wired `/app/events/new` step-2 submit to `POST /api/internal/events` while preserving local communication-planning draft behavior, added create submitting/success/error feedback + post-success list link, updated docs, and `npm run build` passed.

- 2026-03-04 16:44 UTC task-00182: extended `/app/events/new` into a 2-step event wizard with explicit progress/navigation, added step-2 pre-event communications planner for 1-3 touchpoints (days-before + send-time metadata, editable subject/body placeholders), kept scope draft-only with no send plumbing, updated UI foundations/tasks/changelog docs, and build passed.

- 2026-03-04 07:43 UTC task-00177: reduced left-nav Railfin brand logo display size by 50% from current values across breakpoints (5.5rem→2.75rem, 5rem→2.5rem, 4.3rem→2.15rem), preserved fixed logo-anchor wrapper and clip/opacity text transitions for collapse/expand jitter stability, restored sidebar/brand geometry to keep nav spacing usable, updated UI foundations/tasks/changelog docs, and build passed.
- 2026-03-04 07:41 UTC task-00176: updated left-nav Events icon to Lucide Tickets, harmonized primary nav icon colors to cohesive Railfin-complementary high-contrast palette (Create #1d4ed8, Library #6d28d9, Campaigns #0f766e, Events #0369a1, Help #4338ca, Configure #334155), preserved existing collapse/expand sizing and jitter-stability contracts, updated UI docs/tasks/changelog, and build passed.
- 2026-03-04 07:28 UTC task-00174: doubled left-nav Railfin brand logo size by 2x across existing breakpoints (2.75rem→5.5rem, 2.5rem→5rem, 2.15rem→4.3rem), preserved fixed logo-anchor wrapper and clip/opacity-based label transitions to avoid collapse/expand jitter regressions, increased brand spacing and expanded sidebar track widths to prevent brand/nav overlap while keeping responsive behavior intact; updated UI docs/tasks/changelog and build passed.
- 2026-03-04 07:13 UTC task-00171: finalized left-nav micro-jitter fix by removing width-based label animation/reflow and collapsed brand alignment drift; switched label/brand text transitions to clip-path+opacity-only, kept icon/label/logo anchors position-stable during sidebar width animation, added app-shell top-right build SHA badge with env-driven SHA resolution + fallback, updated UI docs/changelog/tasks, and build passed.
- 2026-03-04 07:16 UTC task-00170: fixed subtle left-nav collapse/expand jitter by removing collapsed-state row metric drift (`.rf-nav-item` padding override and label margin override) and locking row metrics across states; kept animation to label width/opacity only, increased nav row height ~20% (1.84rem→2.2rem), increased icon/label scale ~20% (icon render 19→23, icon slot 1.2rem→1.44rem, label 1.13rem→1.36rem), preserved hover-expand/auto-collapse behavior, updated docs, and build passed.
- 2026-03-04 06:59 UTC task-00168: increased left-nav readability with moderate icon/text scale bump (Lucide 15→17; icon slot 1rem→1.1rem; label size 1.05rem) while preserving fixed compact 1.72rem row-height contract from task-00167, fixed initial shell load offset/top-cutoff behavior by forcing top reset on pathname render and disabling browser scroll restoration, preserved hover-expand/delayed auto-collapse usability, updated docs, and build passed.
- 2026-03-04 06:54 UTC task-00167: hard-fixed left-nav row-height consistency across expanded/collapsed/transition states by removing stretch-prone nav list grid behavior, enforcing single fixed compact row height (1.72rem), centering icon+label, preserving fixed icon slot geometry with no icon animation, and keeping collapse animation limited to label visibility; docs updated and build passed.
- 2026-03-04 06:46 UTC task-00166: tightened left-nav row height/density for compact menu items, stabilized icon layer with fixed 1rem icon slot + no icon transition, moved collapse/expand animation to labels only so icons keep size/position without flicker, preserved hover-expand + auto-collapse behavior, updated UI foundations/tasks/changelog docs, and build passed.
- 2026-03-04 06:41 UTC task-00165: swapped in new Railfin nav logo asset and trimmed transparent padding for tighter mark fit; shifted left nav to collapsed-by-default hover-driven behavior (expand on hover/focus, auto-collapse ~2s after leave), removed bottom minimize/maximize controls, added Lucide icons to nav items, compacted nav row heights, preserved responsive shell alignment/behavior, and build passed.
- 2026-03-03 06:27 UTC task-00153: expanded Lexical toolbar to common rich-text set (inline, headings/paragraph, lists incl. checklist, quote/code, link/unlink, alignments, undo/redo, clear formatting); preserved neutral grey Lucide icon+label style, accessibility semantics, and existing create/generate/save/compliance/remediation flows; build passed.
- 2026-03-03 06:19 UTC task-00152: swapped Lexical toolbar controls to Lucide icon+label buttons; kept neutral grey top-bar styling, preserved aria-pressed active states, and verified no command-behavior changes (UI/control-layer only).
- 2026-03-03 task-00149: Lexical UX stabilization shipped (neutral toolbar style, grouped controls with active states, split-layout viewport/scroll tuning, and editor-ready gating for prompt lock/generate/save). Lexical setup follows composer+plugins guidance; intentional difference is text+symbol controls over SVG icon set.
- 2026-03-03 task-00148: shipped Lexical editor phase 1 on Create; generate->Lexical + compliance-read + save/load(html) verified in local build path.
# railfin-ui detailed work log

## 2026-03-03 01:32 UTC — ui log backfill
- task-00133 ✅ merged `a5b5c59`: side-by-side package variant compare + copy/restore actions.
- task-00136 ✅ merged `f7d9b2a`: Create split layout (~2/3 editor, ~1/3 compliance).
- task-00139 ✅ merged `d80a2fe`: split-layout ergonomics and progressive control grouping.
- task-00142 ✅ merged `df9ad21`: Configure > Features subpage with human-readable capability list.


<!-- HISTORICAL_TASK_COVERAGE_START -->
## Historical task coverage index (ui)
- total indexed: 31

- task-00001 | Done | `feat/ui/task-00001-editor-draft-flow`
- task-00004 | Done | `feat/ui/task-00004-save-draft-wireup`
- task-00007 | Done | `feat/ui/task-00007-login-redirect-baseline`
- task-00010 | Done | `chore/ui/task-00010-merge-smoke-doc-touch`
- task-00013 | Done | `chore/ui/task-00013-merge-smoke-retry`
- task-00020 | Done | `chore/ui/task-00020-login-contract-sanity`
- task-00023 | Done | `feat/ui/task-00023-compliance-panel-wireup`
- task-00025 | Done | `feat/ui/task-00025-editor-compliance-integration`
- task-00028 | Done | `feat/ui/task-00028-preview-route-hookup`
- task-00032 | Done | `feat/ui/task-00032-login-editor-ux-polish`
- task-00040 | Done | `feat/ui/task-00040-app-shell-foundation`
- task-00046 | Done | `feat/ui/task-00046-logo-favicon-shell-branding`
- task-00063 | Done | `feat/ui/task-00063-library-page-usable`
- task-00065 | Done | `feat/ui/task-00065-configure-page-usable`
- task-00069 | Done | `feat/ui/task-00069-library-open-draft-flow`
- task-00072 | Done | `feat/ui/task-00072-configure-create-ux-integration`
- task-00075 | Done | `feat/ui/task-00075-policy-context-ux`
- task-00078 | Done | `feat/ui/task-00078-mvp-rc1-visual-consistency`
- task-00096 | Done | `feat/ui/task-00096-review-tools-ux-phase2`
- task-00099 | Done | `feat/ui/task-00099-review-tools-ux-phase3`
- task-00102 | Done | `feat/ui/task-00102-review-workbench-phase4`
- task-00111 | Done (retry completed on correct repo path) | `feat/ui/task-00111-review-workbench-phase6`
- task-00114 | Done | `feat/ui/task-00114-content-review-ux-polish`
- task-00118 | Done | `feat/ui/task-00118-generation-history-panel`
- task-00121 | Done | `feat/ui/task-00121-auto-remediation-ux-phase1`
- task-00124 | Done | `feat/ui/task-00124-remediation-ux-phase2`
- task-00127 | Done | `feat/ui/task-00127-review-workbench-tidy-pass1`
- task-00130 | Done | `feat/ui/task-00130-campaign-package-ux-phase1`
- task-00133 | Done | `feat/ui/task-00133-package-variant-compare-ux`
- task-00136 | Done | `feat/ui/task-00136-create-layout-split`
- task-00139 | Done | `feat/ui/task-00139-ux-stabilization-phase2`
<!-- HISTORICAL_TASK_COVERAGE_END -->
- 2026-03-03 06:43 UTC task-00154: refined Lexical toolbar to icon-only controls and contiguous no-gap strip, enforced one-row no-wrap with horizontal overflow fallback, preserved aria-label/accessibility semantics and command behavior; build passed.
- 2026-03-04 05:12 UTC task-00155: shipped Help Center starter surface (new primary nav item + `/app/help` landing with hero/search-placeholder/topic cards), added detail pages (`/app/help/getting-started`, `/app/help/compliance-basics`) and `/help` shortcut redirect; kept additive `rf-help-*` styling and build passed.

- 2026-03-04 05:38 UTC task-00156: refined Create input UX with a two-mode selector (Select a few topics vs AI prompt) using single-container content swapping; removed header fallback copy, Content Type label, and save-stage reminder sentence; flattened content-type placement above prompt input; preserved generate/save/compliance/remediation/history flows; build passed.
- 2026-03-04 06:02 UTC task-00158: aligned Create Generate actions across Topics/AI prompt modes; added Topics-mode Generate Content action and standardized action order (Lock Prompt, Generate Content) beneath mode content; moved prompt-mode actions under AI Instructions textarea; unified both modes through shared runGenerate pipeline while preserving contentType/topics/purposes context and existing save/compliance/history/remediation behavior; build passed.
- 2026-03-04 06:15 UTC task-00159: increased app-shell top-left Railfin logo from 28px to 60px (>=2x), tuned brand row/text alignment for readability, widened desktop sidebar track with responsive fallback to preserve nav spacing, and build passed.
- 2026-03-04 06:17 UTC task-00160: doubled app-shell top-left Railfin logo again from 60px to 112px, shifted brand treatment to stacked logo+wordmark with lower text prominence, widened desktop sidebar track with responsive fallback to keep nav usable, and build passed.
- 2026-03-04 06:18 UTC task-00161: tripled app-shell top-left Railfin logo from 112px to 336px, retuned brand spacing/text emphasis and sidebar responsive widths to avoid nav overlap/clipping, and build passed.
- 2026-03-04 06:22 UTC task-00162: reduced app-shell top-left Railfin logo by ~50% from task-00161 oversized values (336px→168px desktop with proportional responsive fallbacks), tightened sidebar track sizing to rebalance branding vs nav readability, preserved stacked logo+wordmark responsive behavior, and build passed.
- 2026-03-04 06:26 UTC task-00163: reduced app-shell top-left Railfin logo by 25% from task-00162 values (168px→126px desktop with proportional responsive fallbacks), kept stacked brand alignment/sidebar usability intact, preserved responsive behavior, and build passed.

- 2026-03-04 06:32 UTC task-00164: shipped app-shell left-nav auto-minimize (~3s inactivity when enabled) with bottom controls (manual expand/collapse + auto-minimize toggle), reduced default sidebar width with collapsed rail state, moved Railfin name to logo row, preserved responsive nav/content behavior, and build passed.
- 2026-03-04 07:05 UTC task-00169: shipped second-pass nav visual bump (icons 17→19, icon slot 1.1rem→1.2rem, labels 1.05rem→1.13rem), added distinct accessible per-item nav icon colors, increased top/bottom nav-list padding, and hard-fixed lingering Create initial offset by strengthening AppShell scroll reset across pathname transitions (window/document/container + rAF follow-up) and removing Lexical sync-time `root.selectEnd` viewport-jump trigger; docs updated and build passed.
- 2026-03-04 07:19 UTC task-00172: fixed remaining top-brand horizontal shift on left-nav collapse/expand by locking logo into a fixed-width anchor wrapper (`.rf-brand-logo-wrap`), keeping brand row alignment mode constant across states (no alignment-mode switch), preserving wordmark visibility via clip-path+opacity-only transitions without moving the logo anchor, updating UI docs/changelog/tasks, and build passed.

- 2026-03-04 07:28 UTC task-00173: audited app-shell primary pages for duplicated page labels, removed redundant visible in-content titles on Create/Library/Configure/Events, retained semantic structure via new `.rf-sr-only` headings + spacing modifiers (`rf-page-subtitle-standalone`, `rf-library-subtitle-standalone`), updated UI docs/tasks/changelog/lane report, and build passed.
- 2026-03-04 07:35 UTC task-00175: updated left-nav icon map to requested set (Create=Pickaxe, Library=BookOpenText, Campaigns=Goal target-arrow SVG geometry from repo Lucide source, Help=LifeBuoy, Configure=Settings), preserved icon size/stroke/color-class behavior and existing collapse/expand jitter stability, documented prior default icon mapping fallback in app-shell + UI foundations docs, updated tasks/changelog, and build passed.


## task-00191 — UI/DEV — Lexical selection-command + link/list hotfix

- Status: **Done**
- Branch: `fix/ui/task-00191-lexical-selection-command-fix`
- Scope delivered:
  - Enforced selection-scoped toolbar command execution for inline/alignment/list actions to stop full-editor fallback behavior.
  - Replaced native prompt-based link flow with inline link popover UI and preserved selection for reliable apply/remove operations.
  - Fixed list toggle handling (bullet/number/check) so wrap/unwrap works on selection without content wipe.
  - Updated lexical sanitizer to preserve safe underline/line-through inline decorations needed for save/load persistence.
  - Regression-checked generate→editor, save/load, and compliance extraction flows.
  - Build verification: `npm run build` passed.

- 2026-03-06 04:34 UTC task-00191: shipped Lexical selection-target command hardening, inline toolbar link popover (no native prompt), list toggle/content-preservation fixes, and underline persistence contract fix; updated UI foundations/tasks/changelog/lane report; build passed.