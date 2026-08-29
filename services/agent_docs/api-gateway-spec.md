# API Gateway — single entry point for Pavilion

Implementation spec for `services/gateway`. Execute the parts in order; each part ends with the
commit it should produce.

## Context

Pavilion runs four services (`auth`, `post`, `profile`, `newsletter`) and every one of them
publishes a host port today, so any client can call any service directly. The downstream
services trust `x-user-id` blindly (`requestHeaderHandler`), which means **anyone who can reach
`post:3001` can impersonate any user** by setting a header. Root `CLAUDE.md` already documents
the intended flow — `Client → API Gateway / upstream → injects x-user-id, x-service-name,
x-request-id → service` — but the gateway that makes that sentence true does not exist.

This spec builds `services/gateway`: the only publicly reachable process. It terminates the
client's bearer token, asks `auth` who the user is, and forwards the request to the right
service with the identity headers injected. The four existing services stop publishing host
ports in the production compose target and reject any request that did not carry the shared
gateway secret. In development that check is off and the ports come back, so direct
service-level debugging keeps working exactly as it does now.

### Decisions taken

| | |
|---|---|
| Token verification | Gateway calls a **new `POST /api/v1/verify` in `auth`** — the "JWT only in auth" boundary rule stays intact, no secret sharing |
| Isolation | **Network + shared secret**: no host ports in prod compose, plus `x-gateway-secret` checked in all four services |
| Dev bypass | Check is skipped when `NODE_ENV !== 'production'` |
| Forwarding | **`http-proxy-middleware`** (streams bodies, so `post`'s multipart upload works unchanged) |
| Public URLs | Auth namespaced under `/api/v1/auth/*`, rewritten to auth's flat paths |
| Verify cache | None in this cut |
| Port | **8080** |
| Out of scope | CORS, helmet, rate limiting |

---

## Part 1 — `auth`: token introspection endpoint

Auth mints tokens but has no way to answer "who is this token?". Add it.

**`services/auth/src/controllers/verify.controller.ts`** (new) — read `Authorization: Bearer <token>`,
call the existing `verifyAccessToken` from `services/auth/src/utils/jwt.ts` (already returns
`{ userId }`), respond `res.success({ userId })`. On a missing header or a `jsonwebtoken` throw,
respond `res.error('Invalid or expired access token', 401)`. Wrap with the existing `asyncHandler`.

**`services/auth/src/routes/v1/auth.routes.ts`** — add `router.post('/verify', verifyController)`.
No `validateCredentials`/`validateRefreshToken` guard; the controller is the guard.

Reuse only — no new dependency, no Redis lookup (access tokens are stateless by design here;
revocation lives on the refresh token).

> Commit: `[AUTH] feat: add access token introspection endpoint`

---

## Part 2 — `services/gateway` scaffold

Per `services/agent_docs/new-service-creation.md`: clone
`https://github.com/yazeryanski/express-ts-boilerplate`, `rm -rf .git`, `rm -f package-lock.json`,
`pnpm install`. Then strip what a gateway doesn't have and copy the house files verbatim from
`services/newsletter/` (the newest, cleanest service).

**Deviations from the boilerplate — the gateway has no database:**

- Delete `prisma/`, `src/utils/prisma.ts`, `DATABASE_URL`, the `pnpm.onlyBuiltDependencies`
  Prisma block, and `docker-entrypoint.sh` (nothing to migrate).
- **No `requestHeaderHandler`** — the gateway *produces* those headers, it doesn't consume them.
  Same reason `auth` omits it.
- **No `express.json()`.** This is load-bearing: a consumed request stream cannot be proxied, and
  it would break `POST /api/v1/post`'s multipart upload. The gateway never reads a body.
- `main.ts` gates on no datastore — it just `listen`s. Every other service awaits a dependency
  first; call this out in the service CLAUDE.md so it doesn't read as an omission.

```
services/gateway/
  .dockerignore  .env.example  .gitignore  biome.json  nodemon.json
  package.json  tsconfig.json  Dockerfile  CLAUDE.md
  src/
    config.ts
    main.ts
    middlewares/
      errorHandler.middleware.ts     # copy verbatim
      httpLogger.middleware.ts       # copy verbatim
      responseHandler.middleware.ts  # copy verbatim
      requestContext.middleware.ts   # new — request id + strips spoofable headers
      requireAuth.middleware.ts      # new
    proxy/
      createServiceProxy.ts          # new — shared proxy factory
      routes.ts                      # new — the route table
    routes/index.ts  routes/v1/index.ts  routes/v1/health.router.ts
    services/authClient.ts           # new
    types/auth.types.ts
    utils/asyncHandler.ts  utils/logger.ts   # copy verbatim
```

Copy byte-for-byte from `newsletter`: `nodemon.json`, `biome.json`, `utils/logger.ts`,
`utils/asyncHandler.ts`, `middlewares/{responseHandler,errorHandler,httpLogger}.middleware.ts`,
the three-level router nesting, `.dockerignore`, `.gitignore`.

`package.json`: `name: pavilion-be-gateway`, `packageManager: pnpm@10.13.1`,
`build: "tsc && tsc-alias"`, `main: dist/main.js`. New runtime dependency:
**`http-proxy-middleware` v3** (ships its own types). Everything else matches the other services.
`tsconfig.json`: newsletter's version verbatim (`"@/*": ["./src/*"]`, `strict`, `skipLibCheck`).

**`src/config.ts`** — envalid, same shape as `services/newsletter/src/config.ts`:

```ts
NODE_PORT: port({ devDefault: 8080 }),
NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),
GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' }),
AUTH_SERVICE_URL:       url({ devDefault: 'http://localhost:3000' }),
POST_SERVICE_URL:       url({ devDefault: 'http://localhost:3001' }),
PROFILE_SERVICE_URL:    url({ devDefault: 'http://localhost:3002' }),
NEWSLETTER_SERVICE_URL: url({ devDefault: 'http://localhost:3004' }),
```

**`src/main.ts`** middleware order (note: no `express.json()`, no `requestHeaderHandler`):

```
responseHandler → requestContext → httpLogger → app.use('/api/', router) → proxy routes → errorHandler
```

> Commit: `[GATEWAY] feat: scaffold service from boilerplate`

---

## Part 3 — identity: `authClient` + `requireAuth`

**`src/services/authClient.ts`** — modelled directly on the repo's only existing inter-service
client, `services/newsletter/src/services/profileClient.ts`: native `fetch`, no axios, unwrap the
`{ success, data }` envelope.

```ts
export async function verifyAccessToken(token: string, requestId: string): Promise<string | null>
// POST `${env.AUTH_SERVICE_URL}/api/v1/verify`
// headers: Authorization: Bearer <token>, x-service-name: 'gateway',
//          x-request-id: <requestId>, x-gateway-secret: env.GATEWAY_SECRET
// 200 → data.userId ; 401 → null ; anything else → throw (becomes a 502)
```

**`src/middlewares/requestContext.middleware.ts`** — runs before everything:

- `req.requestId = incoming x-request-id ?? randomUUID()` (`node:crypto`).
- **Deletes `x-user-id`, `x-service-name`, `x-gateway-secret` from `req.headers`.** Without this a
  client could hand the gateway a forged `x-user-id` and, on the unauthenticated `/auth/*`
  passthrough routes, have it forwarded untouched. This is the spoofing fix and the whole reason
  the gateway exists.

**`src/middlewares/requireAuth.middleware.ts`** — parse `Authorization: Bearer <token>`; missing or
malformed → `res.error('Missing access token', 401)`. Call `authClient.verifyAccessToken`; `null`
→ `res.error('Invalid or expired access token', 401)`; otherwise set `req.userId` and `next()`.
Declare `Express.Request.userId`/`requestId` via a `declare global` block, mirroring
`services/post/src/middlewares/requestHeaderHandler.middleware.ts`.

> Commit: `[GATEWAY] feat: verify access tokens against the auth service`

---

## Part 4 — proxying

**`src/proxy/createServiceProxy.ts`** — one factory wrapping `createProxyMiddleware`:

```ts
createServiceProxy({ target, pathRewrite? }) => RequestHandler
// on.proxyReq  → setHeader x-service-name: 'gateway'
//                setHeader x-request-id: req.requestId
//                setHeader x-gateway-secret: env.GATEWAY_SECRET
//                setHeader x-user-id: req.userId   (only when requireAuth ran)
// on.error     → logger.error(...) + res.error('Upstream service unavailable', 502)
```

`changeOrigin: false` — the upstream doesn't care about Host. No `selfHandleResponse`: the
upstream's `{ success, data }` envelope is already the public contract and streams straight
through, including `post`'s error statuses.

**`src/proxy/routes.ts`** — the table, mounted in `main.ts`:

| Public (gateway :8080) | Guard | Upstream |
|---|---|---|
| `GET /api/v1/health` | — | gateway itself (does not proxy) |
| `POST /api/v1/auth/login` · `/register` · `/refresh` · `/logout` | none | `auth` — rewrite `^/api/v1/auth` → `/api/v1` |
| `/api/v1/auth/verify` | **blocked** → `res.error('Not found', 404)` | — (internal only) |
| `/api/v1/post/*` | `requireAuth` | `post` (path as-is) |
| `/api/v1/profile/*` | `requireAuth` | `profile` (path as-is) |
| `/api/v1/newsletter` | `requireAuth` | `newsletter` (path as-is) |

The `/auth/verify` deny rule must be registered **before** the `/api/v1/auth` proxy or the rewrite
will expose introspection publicly.

`post`, `profile` and `newsletter` paths need no rewrite — their internal paths already match
their public ones. Only `auth` is rewritten, because its routes are mounted flat.

> Commit: `[GATEWAY] feat: proxy requests to downstream services`

---

## Part 5 — containerize the gateway

`Dockerfile`: copy `services/post/Dockerfile` and **remove all four Prisma touchpoints**
(`RUN pnpm prisma generate` ×2, `COPY prisma ./prisma`) and the `ENTRYPOINT` + entrypoint-copy
lines. `EXPOSE 8080`; `CMD ["pnpm","dev"]` / `CMD ["node","dist/main.js"]`.
`.dockerignore` verbatim from any service.

**`docker-compose.yml`** — new `gateway` service: image `pavilion/gateway`, container
`pavilion-gateway`, `target: prod`, `ports: ['8080:8080']`, `depends_on` all four services with
`condition: service_healthy`, and every env var set explicitly (`NODE_PORT: 8080`,
`NODE_ENV: production`, `GATEWAY_SECRET: ${GATEWAY_SECRET}`, and the four
`*_SERVICE_URL: http://<svc>:<port>` values using the implicit compose DNS names).
Healthcheck: the plain `auth`-style probe (`wget -qO- http://localhost:8080/api/v1/health || exit 1`)
— the gateway has no `requestHeaderHandler`, so no fake headers are needed.

**`docker-compose.override.yml`** — `gateway` block matching the others: `target: dev`,
`image: pavilion/gateway:dev`,
`command: ['./node_modules/.bin/nodemon','--exitcrash','--legacy-watch']`,
`NODE_ENV: development`, bind mount `./services/gateway/src:/app/src` only (no `prisma`).

Do **not** touch `docker/postgres/init-databases.sh` — the gateway owns no database.

> Commit: `[GATEWAY] feat: containerize the service`

---

## Part 6 — lock down the four services

The same small middleware, **duplicated into each service** (no shared module — root CLAUDE.md
boundary rule).

**`src/middlewares/gatewayOnly.middleware.ts`** (new in `auth`, `post`, `profile`, `newsletter`):

```ts
// Development keeps the services directly callable; production admits gateway traffic only.
if (env.NODE_ENV !== 'production') return next();
if (req.path === '/api/v1/health') return next();
if (req.header('x-gateway-secret') !== env.GATEWAY_SECRET)
  return res.error('Forbidden', 403);
next();
```

Health is exempt so the existing compose healthchecks keep working untouched — it leaks nothing
beyond `"Server is running"`, and with the host ports gone it is only reachable from inside the
compose network anyway.

Wiring in each `src/main.ts`, immediately after `responseHandler` (it needs `res.error`) and
**before** `requestHeaderHandler`, so a forged `x-user-id` is rejected before it is ever read:

- `auth`: `express.json() → responseHandler → gatewayOnly → httpLogger`
- `post` / `profile` / `newsletter`: `express.json() → responseHandler → gatewayOnly → requestHeaderHandler → httpLogger`

Each `src/config.ts` gains `GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' })`, and each
`.env.example` gains the documented var.

> Commits (one per service, per the commit convention):
> `[AUTH] feat: reject requests that did not come through the gateway`
> `[POST] feat: reject requests that did not come through the gateway`
> `[PROFILE] feat: reject requests that did not come through the gateway`
> `[NEWSLETTER] feat: reject requests that did not come through the gateway`

---

## Part 7 — make the gateway the only public entry point

**`docker-compose.yml`** — delete the `ports:` block from `auth`, `post`, `profile`, `newsletter`.
They stay reachable on the compose network by DNS name; nothing on the host can touch them.
Add `GATEWAY_SECRET: ${GATEWAY_SECRET}` to all four services' `environment:`.

**`docker-compose.override.yml`** — re-add `ports:` to those four blocks (`3000:3000`, `3001:3001`,
`3002:3002`, `3004:3004`). Development therefore behaves exactly as it does today: ports published
*and* `NODE_ENV: development` turning the secret check off. Document this in the file's header
comment, matching its existing style of explaining why each override exists.

**Root `.env.example`** — new section:

```
# --- API Gateway --------------------------------------------------------------
# Shared secret proving a request came through the gateway. Enforced only when
# NODE_ENV=production; the dev target leaves the services directly callable.
GATEWAY_SECRET=gatewaySharedSecret1234567890
```

**Root `CLAUDE.md`** — the architecture block gains `gateway/ - Public entry point (auth
termination + reverse proxy)`; the ports line becomes `gateway 8080, auth 3000, …`; the Request
Flow section is updated to describe the real flow (bearer token → gateway → `auth /verify` →
identity headers + `x-gateway-secret` → service); Boundaries gains "external traffic reaches
services only through the gateway; only the gateway publishes a host port in the prod target";
READ WHEN gains the gateway entry.

> Commit: `[GLOBAL] feat: route all external traffic through the API gateway`

**`services/gateway/CLAUDE.md`** — following `services/newsletter/CLAUDE.md`'s structure: what it
does, port 8080, the route table from Part 4, the identity contract, why there is no Prisma / no
`express.json()` / no `requestHeaderHandler` / no startup dependency gate, and the dev-vs-prod
isolation behaviour.

> Commit: `[GATEWAY] docs: add service documentation`

---

## Verification

**Per-service checks** (in `services/gateway`, and in each modified service):

```
pnpm build          # must emit dist/main.js with aliases rewritten
pnpm biome check
```

**Development stack** — `docker compose up --build`, then:

1. `curl localhost:8080/api/v1/health` → `{"success":true,...}`.
2. Register through the gateway:
   `curl -X POST localhost:8080/api/v1/auth/register -H 'content-type: application/json' -d '{"email":"a@b.c","password":"password123"}'`
   → token pair. Confirms the `/auth` → flat rewrite and that the missing `express.json()` does
   not break JSON forwarding.
3. `curl localhost:8080/api/v1/newsletter` with no header → 401. With
   `-H "Authorization: Bearer $ACCESS"` → 200 and a feed. Confirms `requireAuth` → `/verify` →
   `x-user-id` injection end to end.
4. Spoof attempt: `-H 'x-user-id: someone-else'` alongside a valid bearer → the response must
   reflect the **token's** user, not the header. Confirms `requestContext` strips it.
5. Multipart streaming:
   `curl -X POST localhost:8080/api/v1/post -H "Authorization: Bearer $ACCESS" -F 'content=hi' -F 'image=@some.png'`
   → 201 with an `imageUrl`. This is the test that fails if `express.json()` sneaks back in.
6. `curl localhost:8080/api/v1/auth/verify` → 404.
7. Dev bypass still works: `curl localhost:3002/api/v1/profile/<id>` with the three identity
   headers → 200, exactly as before this change.

**Production stack** — `docker compose down && docker compose -f docker-compose.yml up --build`:

8. `curl localhost:3001/...` → connection refused (no published port).
9. `docker exec pavilion-gateway wget -qO- --header='x-user-id: x' --header='x-service-name: x' --header='x-request-id: x' http://post:3001/api/v1/post/xyz`
   → `403 Forbidden` (on-network but no secret). Add `--header="x-gateway-secret: $GATEWAY_SECRET"`
   → the normal 404/200. This is the isolation proof.
10. `docker compose ps` → all six services `healthy` (confirms the health exemption).
