# API Boundary

## `/api/internal/*`
Internal service endpoints for trusted, non-public use (e.g., internal orchestration and system-to-system operations).

### Internal content draft scaffold
- Endpoint module: `src/api/internal/content/draft.ts`
- Path intent: `/api/internal/content/draft`
- Purpose: internal draft create/read scaffold for early integration and service wiring.

### Internal content generate scaffold
- Endpoint module: `src/api/internal/content/generate.ts`
- Path intent: `/api/internal/content/generate`
- Purpose: internal generation entry point scaffold for prompt + content type input, with provider abstraction shape (Codex-preferred, fallback-capable) returning placeholder draft payloads only.

### Internal compliance check scaffold
- Endpoint module: `src/api/internal/compliance/check.ts`
- Path intent: `/api/internal/compliance/check`
- Purpose: internal compliance-check entry point scaffold for submitted content, returning normalized placeholder findings (`severity`, `issue`, `details`, `suggestion`, `location`) with no external provider/model calls.

### Merge Smoke Retry Notes
- task-00012: docs-only merge-flow smoke retry recorded on branch `chore/dev/task-00012-merge-smoke-retry` to validate branch, commit, and push path.

## `/api/v1/*`
External API surface intended for clients and integrations.

> Note: `/api/v1/*` is external and versioned.
