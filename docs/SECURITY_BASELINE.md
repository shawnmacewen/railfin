# Security Baseline

## Core rules

- No secrets in git.
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only.
- Rotate leaked keys immediately.

## Auth Baseline (MVP)

- Guarded application surface: `/app/*`.
- Implemented in root `middleware.ts` with `matcher: ['/app/:path*']`.
- `/login` is expected to remain public and accept optional `next` for post-login return.
- Current middleware placeholder check is exactly:
  - `request.cookies.get('session')?.value`
- Behavior:
  - Missing session cookie on `/app/*` -> redirect to `/login?next=<pathname>`
  - Session cookie present -> request continues
- Baseline redirect contract preserves `pathname` as `next` (query string is not currently preserved).
- This MVP is intentionally minimal until full Supabase session validation is wired; no provider expansion in this phase.
- Keep middleware behavior and this section in sync to prevent `/app/*` bypass.

## Merge Smoke Retry Notes

- Merge-flow smoke retry completed for task-00014 as a docs-only change.
- No application logic, auth behavior, or secret-handling rules were modified in this retry.
- Purpose: validate branch + commit + push flow for SEC process hygiene.

## Environment hygiene validation

- `.gitignore` ignores all dotenv files by default: `.env*`.
- `.gitignore` explicitly allows only the template file: `!.env.example`.
- `.env.example` contains placeholder variable names only and no real values.

## Secret handling checklist

- Never commit secrets, tokens, private keys, or production credentials.
- Keep real secrets only in runtime secret managers / deployment environment settings.
- Use `.env.example` strictly as a schema template (empty or dummy values only).
- If exposure is suspected, rotate compromised credentials immediately and audit recent access.
