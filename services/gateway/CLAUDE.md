# API Gateway

The public entry point. Terminates the client's access token, then reverse-proxies to the service
that owns the path, injecting the identity headers those services trust.

See root `../../CLAUDE.md` for stack, conventions, response envelope, request flow, and
boundaries. Gateway-specific notes below.

Port **8080** — the only port published in the prod compose target. Build uses `tsc && tsc-alias`.

Requires no datastore: no Prisma, no `prisma/`, no migrations, and therefore no
`docker-entrypoint.sh`. It is also the one service that does **not** gate startup on a dependency
— an upstream that is down surfaces per request as a 502 rather than preventing boot.

## Routing (`src/proxy/routes.ts`)

| Public path | Guard | Upstream |
|---|---|---|
| `GET /api/v1/health` | — | answered here, not proxied |
| `/api/v1/auth/*` | none | `auth`, rewriting `^/api/v1/auth` → `/api/v1` |
| `/api/v1/auth/verify` | — | **blocked, 404** |
| `/api/v1/post/*` | `requireAuth` | `post` |
| `/api/v1/profile/*` | `requireAuth` | `profile` |
| `/api/v1/newsletter` | `requireAuth` | `newsletter` |
| anything else | — | catch-all 404 in the standard envelope |

Auth is the only public upstream — logging in cannot require being logged in — and the only one
rewritten, because it mounts its routes flat (`/api/v1/login`) while the gateway namespaces them
under `/auth`. Registration order in `routes.ts` matters: the `/auth/verify` block must precede
the auth proxy, and the catch-all must come last.

## How a request is handled

1. `requestContext` assigns `req.requestId` (reusing an inbound `x-request-id` when present) and
   **deletes any client-supplied `x-user-id`, `x-service-name`, `x-gateway-secret`**. This is the
   reason the gateway exists: downstream services trust `x-user-id` unconditionally, so a
   smuggled one would be full impersonation.
2. `requireAuth` reads the `Authorization: Bearer` token and resolves it via
   `services/authClient.ts` → `auth POST /api/v1/verify`. 401 from auth → 401 to the client; any
   other failure throws, so an unreachable auth service is a 502, not a bad token.
3. `createServiceProxy` streams the request on, setting `x-user-id` (protected routes only),
   `x-service-name: gateway`, `x-request-id` and `x-gateway-secret`.

Verification is **not cached** — every protected request costs one call to auth. Deliberate for
now; a short-TTL cache is the obvious first optimisation, at the cost of a revocation window.

## Service-specific rules

- **Never add `express.json()`** (or any body parser). A consumed request stream cannot be
  proxied, and `POST /api/v1/post` is `multipart/form-data`. The gateway never reads a body.
- **Never add `requestHeaderHandler`.** The gateway produces those headers; it does not consume
  them. Same reason `auth` omits it.
- **Never verify a JWT here.** The gateway holds no token secret by design — that boundary is
  what keeps `/verify` in `auth`.
- Mount proxies at the app root with `pathFilter`, never `app.use('/path', proxy)`.
  http-proxy-middleware forwards `req.url`, and Express strips the mount prefix from it, so a
  mounted proxy reaches the upstream with the prefix missing. A plain-string `pathFilter` matches
  by prefix.
- A new downstream endpoint is not publicly reachable until it is added here.

## Isolation

The four services refuse any request without a matching `x-gateway-secret`
(`gatewayOnly.middleware.ts`, duplicated in each), enforced only when `NODE_ENV=production`;
`/api/v1/health` is always exempt so the compose healthchecks keep working.

- `docker compose up` (dev) — services keep their published ports and the check is off, so they
  stay directly callable exactly as before the gateway existed.
- `docker compose -f docker-compose.yml up` (prod) — only 8080 is published, and a service reached
  from inside the compose network without the secret answers 403.

## Config (`.env`)

- `NODE_PORT` (default 8080), `NODE_ENV`, `GATEWAY_SECRET`, and `AUTH_SERVICE_URL`,
  `POST_SERVICE_URL`, `PROFILE_SERVICE_URL`, `NEWSLETTER_SERVICE_URL`.
- `GATEWAY_SECRET` must match what the four services see; under Docker the root `.env` supplies
  it to the whole stack.
