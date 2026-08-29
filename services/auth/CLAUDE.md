# Auth Service

The upstream token issuer. Verifies credentials and mints/rotates JWTs. All JWT verification lives here — downstream services never validate tokens.

See root `../../CLAUDE.md` for stack, conventions, response envelope, and boundaries. Auth-specific notes below.

Requires PostgreSQL **and Redis** — refuses to start unless both connect.

## Endpoints (`/api/v1`)

- `POST /register` — create user, return token pair
- `POST /login` — verify credentials, return token pair
- `POST /refresh` — rotate: validate refresh token, issue new pair
- `POST /logout` — delete stored refresh token
- `POST /verify` — introspect an access token; `Authorization: Bearer <token>` → `{ userId }`

`register`/`login` are gated by `validateCredentials`; `refresh`/`logout` by `validateRefreshToken`.
`verify` is guarded by the token it receives, so it takes no middleware.

`verify` exists for the API gateway: JWT verification lives only here, so the gateway asks this
service who a bearer token belongs to before injecting `x-user-id` downstream. It is internal —
the gateway refuses to proxy `/api/v1/auth/verify` from outside.

## Tokens

- Access (`ACCESS_TOKEN_SECRET`, 15 min) + refresh (`REFRESH_TOKEN_SECRET`, 7 days). Constants in `src/config.ts`.
- Redis stores the current refresh token as `userId → token` with the refresh TTL. A refresh/logout is only valid if the presented token matches the stored one — this enforces single active refresh token and rotation on every refresh (`src/utils/initTokens.ts`).
- Passwords hashed with bcryptjs (10 rounds).

## Auth vs. downstream

- Does **not** use `requestHeaderHandler` — it issues the identity headers, it doesn't consume them.
- `validateRefreshToken` writes `userId` onto `req.body` for the controller; there is no `req.userId` here.

## Config

- Redis password may be unset.
- `User` model: `id`, `email` unique, `password`, `createdAt`, `disabledAt?`.
