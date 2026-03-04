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
