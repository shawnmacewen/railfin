## 2026-03-04 05:53 UTC — task-00157 create topics/purpose wiring
- Updated Create generation UX (`src/ui/editor-shell.tsx`, `src/app/globals.css`):
  - content-type buttons moved above creation-method selector
  - Topics toggles added (Tax Season 2026, AI and Jobs, Financial Wellness)
  - Purpose toggles added (Lead Outreach, Social Growth, Follower Growth)
- Wired selected topics/purposes through generation request payload for both single and package generate requests.
- Extended backend generation scaffold (`src/api/internal/content/generate.ts`) to validate and inject `topics` + `purposes` into `buildGenerationPrompt(...)`.
- Updated API route typing for new fields (`src/app/api/internal/content/generate/route.ts`).
- Updated docs: `docs/UI_FOUNDATIONS.md`, `docs/API_BOUNDARY.md`, `docs/tasks.md`, `docs/CHANGELOG.md`.
- Build verification: `npm run build` passed.

# railfin-dev detailed work log

## 2026-03-03 06:20 UTC — task-00150 lexical data-contract hardening
- Hardened Lexical draft boundary handling via new `src/ui/lexical-contract.ts` (sanitize/normalize HTML + bounded payloads).
- Updated editor change and draft load paths to enforce canonical HTML + deterministic compliance text extraction.
- Updated docs: API boundary, task ledger, changelog.
- Build verification: `npm run build` passed.


## 2026-03-03 01:32 UTC — dev log backfill
- task-00129 ✅ merged `36eab52`: package mode backend (`single|package`) + strict package/per-asset validation.
- task-00132 ✅ merged `073f876`: additive package export schema (`data.package.export`) + normalized block validation.
- task-00140 ✅ merged `8c4e382`: aligned UI package flow to canonical package-mode API request.


<!-- HISTORICAL_TASK_COVERAGE_START -->
## Historical task coverage index (dev)
- total indexed: 52

- task-00000 | Done | `feat/dev/task-00000-supabase-wireup`
- task-00003 | Done | `feat/dev/task-00003-internal-generate-stub`
- task-00008 | Done | `feat/dev/task-00008-internal-compliance-stub`
- task-00009 | Done | `chore/dev/task-00009-merge-smoke-doc-touch`
- task-00012 | Done | `chore/dev/task-00012-merge-smoke-retry`
- task-00015 | Done | `feat/dev/task-00015-supabase-session-wiring`
- task-00022 | Done | `feat/dev/task-00022-auth-login-endpoint`
- task-00026 | Done | `feat/dev/task-00026-compliance-contract-align`
- task-00027 | Done | `feat/dev/task-00027-next-preview-bootstrap`
- task-00041 | Done | `feat/dev/task-00041-shell-route-wiring`
- task-00043 | Done | `feat/dev/task-00043-ai-compliance-engine`
- task-00047 | Done | `feat/dev/task-00047-default-route-to-create`
- task-00055 | Done | `fix/dev/task-00055-rerun-supabase-runtime-verify`
- task-00058 | Done | `fix/dev/task-00058-unblock-supabase-runtime`
- task-00060 | Done | `chore/dev/task-00060-launch-evidence-capture`
- task-00066 | Done | `feat/dev/task-00066-configure-policy-contract`
- task-00068 | Done | `feat/dev/task-00068-configure-policy-persistence`
- task-00071 | Done | `fix/dev/task-00071-suspense-route-stability`
- task-00074 | Done | `feat/dev/task-00074-policy-to-compliance-context`
- task-00077 | Done | `feat/dev/task-00077-mvp-rc1-stabilization`
- task-00080 | Done | `feat/dev/task-00080-sensitive-route-hardening`
- task-00081 | Done | `feat/dev/task-00081-prod-draft-persistence-verify`
- task-00082 | Done | `feat/dev/task-00082-save-draft-api-rewire`
- task-00084 | Done | `chore/sec/task-00084-final-evidence-gate`
- task-00085 | Done | `chore/dev/task-00085-ai-compliance-decision-plan`
- task-00086 | Done | `feat/dev/task-00086-compliance-request-wireup`
- task-00087 | Done | `chore/dev/task-00087-ai-service-contract-unification`
- task-00088 | Done | `task-00088-merge`
- task-00091 | Done | `feat/dev/task-00091-ai-runtime-hardening-phase1`
- task-00092 | Done | `feat/dev/task-00092-content-tools-kickoff`
- task-00093 | Done | `feat/ui/task-00093-review-tools-kickoff`
- task-00094 | Done | `feat/dev/task-00094-review-tools-actions-phase1`
- task-00095 | Done | `feat/dev/task-00095-content-tools-phase2`
- task-00098 | Done | `feat/dev/task-00098-content-tools-phase3`
- task-00101 | Done | `feat/dev/task-00101-content-tools-phase4`
- task-00104 | Done | `feat/dev/task-00104-content-tools-phase5`
- task-00107 | Done | `fix/dev/task-00107-library-unauthorized-hotfix`
- task-00108 | Done | `fix/dev/task-00108-emergency-authz-regression-rollback`
- task-00109 | Done | `feat/dev/task-00109-openai-primary-wiring`
- task-00110 | Done (Retry completed on correct repo path: /home/node/railfin-repo) | `feat/dev/task-00110-content-tools-phase6`
- task-00113 | Done | `feat/dev/task-00113-codex-runtime-verification`
- task-00116 | Done | `feat/dev/task-00116-openai-primary-refactor`
- task-00117 | Done | `feat/dev/task-00117-prompt-presets-control-panel`
- task-00120 | Done | `feat/dev/task-00120-auto-remediation-engine-phase1`
- task-00123 | Unknown | `feat/dev/task-00123-auto-remediation-engine-phase2`
- task-00126 | Unknown | `feat/dev/task-00126-remediation-audit-trail-persistence`
- task-00129 | Done | `feat/dev/task-00129-campaign-package-generator-phase1`
- task-00132 | Done | `feat/dev/task-00132-package-export-schema-phase1`
- task-00135 | Done | `feat/dev/task-00135-config-changelog-subpage`
- task-00137 | Done | `fix/dev/task-00137-ux-stability-support`
- task-00140 | Done | `feat/dev/task-00140-package-ux-api-alignment`
- task-00142 | Done | `feat/ui/task-00142-config-features-subpage`
<!-- HISTORICAL_TASK_COVERAGE_END -->
