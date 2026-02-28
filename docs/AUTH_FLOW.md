# Auth Flow Contract (MVP)

This document defines the baseline auth routing contract for the current phase.

## Route expectations

### `/login` (public)

- Must remain publicly accessible.
- Accepts optional `next` query param indicating the originally requested protected path.
- After successful login/session creation, app should redirect to:
  - `next` value when present and safe.
  - `/app` when `next` is absent.

### `/app/*` (protected)

- All routes under `/app/*` are protected by root middleware.
- Unauthenticated requests are redirected to `/login`.
- Middleware preserves requested path in `next` query param.

## Current middleware contract (implementation-aligned)

- File: `middleware.ts`
- Matcher: `['/app/:path*']`
- Placeholder auth check used right now:

```ts
const sessionCookie = request.cookies.get('session')?.value;
```

- Redirect behavior when cookie is missing:

```ts
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('next', pathname);
return NextResponse.redirect(loginUrl);
```

Notes:
- `next` currently preserves `pathname` only (not query string).
- This is intentionally minimal until full Supabase session validation is wired.
- No auth-provider expansion is included in this phase.
