# Preview Runbook

This project now includes a minimal Next.js preview shell for local workflow checks.

## Prerequisites

- Node.js 20+ (Node 22 is fine)
- npm

## Install

From repo root:

```bash
npm install
```

## Run local preview

```bash
npm run dev
```

Default URL:

- `http://localhost:3000`

## Preview routes

- Login page: `http://localhost:3000/login`
- Create page (current editor flow host): `http://localhost:3000/app/create`
- Library scaffold page: `http://localhost:3000/app/library`
- Campaigns scaffold page: `http://localhost:3000/app/campaigns`
- Configure scaffold page: `http://localhost:3000/app/configure`
- Legacy editor path (redirects to `/app/create`): `http://localhost:3000/app/editor`

## API routes used by preview UI

- Login action endpoint: `POST /auth/login`
  - full URL: `http://localhost:3000/auth/login`
- Compliance check endpoint: `POST /api/internal/compliance/check`
  - full URL: `http://localhost:3000/api/internal/compliance/check`

## Middleware note for `/app/*`

`/app/*` is guarded by middleware and redirects to `/login?next=...` when no `session` or `auth-token` cookie is present.

For quick preview testing of editor route in browser:

1. Open DevTools console on `http://localhost:3000/login`
2. Set a placeholder cookie:

```js
document.cookie = "session=preview; path=/";
```

3. Navigate to `http://localhost:3000/app/editor`
