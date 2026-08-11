<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A NestJS + Prisma API boilerplate with Supabase auth, RBAC permissions, activity logging, and API docs baked in.</p>

## Features

- **Auth** — Supabase Auth (email/password) as the identity provider; the API verifies Supabase-issued JWTs and never stores passwords.
- **Permissions (RBAC)** — `Permission` / `Role` / `RolePermission` / `UserRole` Prisma models. Users hold one or more roles; roles hold one or more permissions.
- **Guards, not middleware** — request auth/authz is enforced with Nest guards (see [Guards vs. middleware vs. interceptors](#guards-vs-middleware-vs-interceptors)).
- **Activity logging** — every mutating request from an authenticated user is recorded to an `ActivityLog` table (who did what, when, from where).
- **Structured logging** — [nestjs-pino](https://github.com/iamolegga/nestjs-pino) for request/error logs (pretty-printed in dev, JSON in prod), plus a global exception filter that logs every error.
- **Swagger docs** — live at `/api/docs`, covering every module.
- **Rate limiting** — `@nestjs/throttler`, global default + tighter limits on `/auth/login` and `/auth/register`.
- **Consistent response/error envelopes** — every response is shaped the same way (see [Response & error format](#response--error-format)).

## Project setup

```bash
npm install
```

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

### Environment variables

| Variable | Description |
| --- | --- |
| `APP_NAME`, `APP_URL`, `APP_PORT` | Basic app metadata / listen port. |
| `NODE_ENV` | `development` \| `production` \| `test` \| `staging`. |
| `DB_URL` | Supabase Postgres **pooled** connection string (port `6543`, `?pgbouncer=true`). Used by the app at runtime. |
| `DIRECT_URL` | Supabase Postgres **direct** connection string (port `5432`, no pooler). Used only by `prisma migrate` — pgbouncer's transaction mode doesn't support the prepared statements migrations need. |
| `SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxx.supabase.co`. |
| `SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key. Used for the user-facing auth client (signUp/signIn/refresh). |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key. **Server-side only, never expose this.** Used for admin operations (e.g. revoking sessions on logout). |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Settings → "legacy JWT secret". Used to verify access tokens locally on every request, without a network round-trip. |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Rate limit window (ms) and max requests per window. Defaults: `60000` / `100`. |
| `LOG_LEVEL` | `fatal`\|`error`\|`warn`\|`info`\|`debug`\|`trace`. |
| `CORS_ORIGIN` | `*` or a comma-separated allowlist of origins. |

> **Note on Supabase JWT verification**: this boilerplate verifies access tokens against the legacy shared `SUPABASE_JWT_SECRET` (HS256). Newer Supabase projects can opt into asymmetric "JWT Signing Keys" (ES256/RS256) instead — if you've enabled that, you'd need to switch `JwtAuthGuard` to JWKS-based verification instead of `jsonwebtoken.verify(token, secret)`.

### Database (Supabase Postgres)

The app uses Supabase's own Postgres database, not a separate MySQL instance — one Supabase project covers both auth and data.

Get your connection strings from **Project Settings → Database → Connection string** in the Supabase dashboard:

- Copy the **Transaction** pooler string (port `6543`) into `DB_URL` — add `?pgbouncer=true` if it isn't already there.
- Copy the **direct** connection string (port `5432`) into `DIRECT_URL`.

(These are separate from the `SUPABASE_*` API keys above — they live under "Database", not "API".)

```bash
npx prisma generate           # generate the Prisma client into ./generated/prisma
npx prisma migrate dev --name init  # first run: creates prisma/migrations/ against your Supabase DB
npx prisma migrate deploy     # subsequent environments: apply existing migrations
npm run prisma:seed           # seed baseline permissions + admin/user roles
```

> `prisma/migrations/` is currently empty — run `migrate dev` once against a real Supabase connection to generate the initial migration; there's no local Postgres in this dev sandbox to generate one against ahead of time.

The seed script (`prisma/seed.ts`) creates the permission keys used by `@Permissions()` decorators throughout the API (see `src/common/constants/permissions.constant.ts`) and two roles:

- **admin** — every permission.
- **user** — `users.read`, `posts.read`, `posts.create` (the default role granted on `/auth/register`).

Run the seed **before** registering your first user — registration attaches the `user` role by name, which must already exist.

## Running the app

```bash
npm run start:dev   # watch mode
npm run start        # single run
npm run start:prod   # from dist/
```

Swagger UI: `http://localhost:3000/api/docs` — click **Authorize** and paste an access token from `/auth/login` to try authenticated routes.

## Auth flow

All auth endpoints live under `/auth` and proxy to Supabase Auth:

| Endpoint | Public? | Description |
| --- | --- | --- |
| `POST /auth/register` | yes | Creates a Supabase user + a local `User` row with the default `user` role. |
| `POST /auth/login` | yes | Exchanges credentials for a Supabase session (access + refresh token). |
| `POST /auth/refresh` | yes | Exchanges a refresh token for a new session. |
| `POST /auth/logout` | no | Revokes the current session's refresh tokens. |
| `GET /auth/me` | no | Returns the current user's profile + role names. |

Send the access token as `Authorization: Bearer <token>` on subsequent requests. `/auth/login` and `/auth/register` carry tighter rate limits than the rest of the API.

## Permissions (RBAC)

```
User ─┬─< UserRole >─┬─ Role ─┬─< RolePermission >─┬─ Permission
      (many-to-many)          (many-to-many)
```

- Manage permissions: `GET/POST/PATCH/DELETE /permissions` (requires `permissions.manage`).
- Manage roles: `GET/POST/PATCH/DELETE /roles`, `POST /roles/:id/permissions`, `DELETE /roles/:id/permissions/:permissionId` (requires `roles.manage`).
- Assign roles to a user: `POST /users/:userId/roles`, `DELETE /users/:userId/roles/:roleId` (requires `roles.manage`).

Add a new permission check to any route with:

```ts
@Permissions(PERMISSIONS.USERS_DELETE)
@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) { ... }
```

Permission keys live in `src/common/constants/permissions.constant.ts` — add new ones there so they're picked up by the seed script and stay type-safe.

## Guards vs. middleware vs. interceptors

This API uses **guards** for authentication (`JwtAuthGuard`) and authorization (`PermissionsGuard`), not middleware. The reason: Express middleware runs *before* routing is resolved, so it has no access to the matched route handler or its decorator metadata — it can't tell whether a route is `@Public()` or which `@Permissions(...)` it requires. Guards run *after* routing, with a full `ExecutionContext` and `Reflector` access, which is exactly what's needed to read those decorators and make an allow/deny decision per-route.

**Interceptors** are used for the two cross-cutting concerns that wrap the response stream rather than gate access: `ResponseInterceptor` (shapes every success response) and `ActivityLogInterceptor` (records mutating requests after they complete, without blocking or altering the response).

Guard execution order (registered as global `APP_GUARD` providers in `app.module.ts`): **`ThrottlerGuard` → `JwtAuthGuard` → `PermissionsGuard`**.

## Logging

- **Errors / request logs**: `nestjs-pino` replaces Nest's default logger. Pretty-printed to the console in development, structured JSON in production (suitable for shipping to a log aggregator). `AllExceptionsFilter` (global `APP_FILTER`) catches every thrown error, logs it (full stack for 5xx, warn-level for 4xx), and returns the standard error envelope — the `Authorization` header is redacted from logs.
- **Activity logs**: `ActivityLogInterceptor` (global `APP_INTERCEPTOR`) writes an `ActivityLog` row for every non-`GET` request made by an authenticated user (method, path, status code, IP, user agent, and an `action` name — defaults to `"METHOD /path"`, override with `@LogActivity('users.create')`, or opt a route out entirely with `@SkipActivityLog()`). Browse them via `GET /activity-logs` (requires `activity-logs.read`).

## Rate limiting

Global default is `THROTTLE_LIMIT` requests per `THROTTLE_TTL` ms (100 req / 60s out of the box), enforced by `ThrottlerGuard`. `/auth/login` and `/auth/register` override this with a stricter per-route `@Throttle(...)` limit since they're common brute-force targets.

## Response & error format

Every successful response is wrapped by `ResponseInterceptor`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { "...": "..." },
  "timestamp": "2026-08-10T13:00:00.000Z"
}
```

Override the `message` with `@ResponseMessage('User created')`. Every error, thrown from anywhere, is caught by `AllExceptionsFilter` and shaped the same way:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "error": "NotFoundException",
  "path": "/users/123",
  "timestamp": "2026-08-10T13:00:00.000Z"
}
```

(In non-production environments, error responses also include a `stack` field.)

## Project structure

```
src/
  common/
    constants/       # permission keys + default roles (used by seed + decorators)
    decorators/       # @Public, @Permissions, @CurrentUser, @ResponseMessage, @LogActivity
    guards/            # JwtAuthGuard, PermissionsGuard
    filters/            # AllExceptionsFilter
    interceptors/        # ResponseInterceptor, ActivityLogInterceptor
    types/                 # AuthenticatedUser
  config/                  # env config/validation, swagger.config.ts
  modules/
    auth/                    # Supabase-backed register/login/refresh/logout/me
    permissions/              # Permission + Role CRUD, role<->permission and user<->role assignment
    activity-logs/             # GET /activity-logs
    users/                      # user profile CRUD (creation happens via /auth/register)
    posts/                       # stub module (no endpoints implemented)
    database/                     # global PrismaClient wrapper
```

## Run tests

```bash
npm run test       # unit tests
npm run test:e2e   # e2e tests
npm run test:cov   # coverage
```

## Known limitations

- Supabase JWT verification uses the legacy shared secret (HS256) — see the note under [Environment variables](#environment-variables) if your project uses asymmetric JWT Signing Keys instead.
- `posts` is left as a stub (no endpoints) — it wasn't part of the original scope, so there's nothing yet to guard/document.
- The `where`/`orderBy`/`cursor` query params on `GET /users` accept raw JSON-encoded Prisma filters; they're now gated behind the `users.read` permission, but treat that permission as "can run arbitrary read filters," not just "can list users."

## Deployment

See the [NestJS deployment docs](https://docs.nestjs.com/deployment) for general guidance. Set `NODE_ENV=production` so pino switches to structured JSON logs and error responses stop including stack traces.
