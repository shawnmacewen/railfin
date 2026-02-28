# UI Foundations (M0)

_Last updated: 2026-02-27 22:29 ET_

## Initial Content Types

- Article
- Newsletter
- Email
- Social Media Post

## MVP Notes

- Compliance check is button-triggered in MVP.
- No branding yet; use a neutral design baseline.

## Draft Flow Behavior (M1 Block A, UI-only)

- Editor shell includes a Topic / Prompt input field.
- Editor shell includes a Draft textarea for authoring content.
- Save Draft is available as a button with a UI-only placeholder handler.
- Draft save currently does not persist data (no backend wiring yet).
- Compliance and policy logic are intentionally deferred.

## Save Draft Flow Notes (M1 Block B)

- Save Draft now issues `POST /api/internal/content/draft` from the editor shell.
- Request payload uses a simple placeholder mapping:
  - `title`: Topic / Prompt value, with fallback to `${contentType} Draft`
  - `body`: Draft textarea content
- UI states implemented for MVP:
  - `saving`: Save button disabled and label changes to "Saving..."
  - `success`: Inline success message shown after a successful response
  - `error`: Inline error message shown on failed request
- Error handling remains intentionally simple (single catch path, no retries).
- Compliance wiring remains deferred and unaffected.

## Merge Smoke Retry Notes

- Performed docs-only merge-flow smoke retry update for task-00013.
- Confirmed task tracker and UI foundations docs are aligned for Done state.

## Login + Redirect Baseline (M1 Block C, UI-only)

- Added a minimal login screen shell with:
  - Email field
  - Password field
  - Sign In button
- Sign In flow is intentionally a UI placeholder only (no backend/auth SDK integration).
- Added `next` redirect contract note for post-login behavior:
  - Read `next` from query params on page load.
  - If `next` is a safe internal relative path, redirect there after successful login.
  - Otherwise fallback to `/app`.
- This establishes redirect UX baseline while keeping auth implementation deferred.
