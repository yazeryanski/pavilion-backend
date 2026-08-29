# Pavilion Backend

Pavilion — A social network application built on a microservice architecture.

## Architecture

```
services/
  auth/       - Authentication & token issuance
  post/       - Post CRUD and image uploads
  profile/    - User profile management
  newsletter/ - Per-user feed of friends' posts (RabbitMQ consumer)
```

## Stack (all services)

- Node.js / Express / TypeScript (strict mode)
- Prisma + PostgreSQL (each service has its own database)
- Winston (logging: console + `logs/error.log` + `logs/combined.log`)
- Biome (linter + formatter) — required for all services
- envalid (environment variable validation)
- Zod (input validation — use when validation is needed; not mandatory in every service)
- nodemon (dev server)
- pnpm (package manager — every service; `packageManager` is pinned in each `package.json`)

Each service has its own CLAUDE.md with service-specific details.

## Running the stack (Docker)

The whole system — Postgres, Redis, RabbitMQ, MinIO and all four services — comes up with one
command from the repo root. This is the normal way to run Pavilion; there are no host
prerequisites beyond Docker.

```
cp .env.example .env          # first time only
docker compose up             # dev: hot reload via bind-mounted src/
docker compose down           # stop (add -v to also wipe the data volumes)
```

- `docker-compose.override.yml` is applied automatically and selects each image's `dev` target
  (nodemon + ts-node, `services/<svc>/src` bind-mounted). Edits on the host restart the process
  in the container.
- Production shape (compiled `dist/`, prod deps only):
  `docker compose -f docker-compose.yml up --build`.
- **Postgres is published on host port 5433**, not 5432 — a native install commonly holds 5432.
  Inside the compose network services still connect to `postgres:5432`.
- One Postgres container holds four databases, one per service, created with their own
  non-superuser roles by `docker/postgres/init-databases.sh`. That script runs **only** on first
  creation of the volume; `docker compose down -v` forces a re-run.
- Each service's entrypoint runs `prisma migrate deploy` before starting, so a cold
  `docker compose up` yields a fully migrated system.
- Compose supplies all configuration via the environment. The `services/*/.env` files are
  excluded from the images and only apply when running a service directly on the host.

Ports: auth 3000, post 3001, profile 3002, newsletter 3004, RabbitMQ UI 15672, MinIO console 9001.

## Commands

Same across services (run from `services/<service>/`):

```
pnpm dev         # nodemon
pnpm build       # tsc && tsc-alias  (tsc-alias rewrites the path aliases in dist/)
pnpm start       # node dist/main.js
pnpm biome check # lint + format
```

`pnpm build` **must** be `tsc && tsc-alias` in every service — `tsc` alone leaves `@utils/...`
requires in `dist/`, which crashes at runtime.

Each service refuses to start unless its datastore connects (`src/main.ts`); some need extras (auth: Redis, post: S3-compatible store).

## Conventions (all services)

- Routes under `/api/v1`; every service exposes `GET /api/v1/health`.
- Env validated via envalid in `src/config.ts` (see each `.env.example`).
- Path aliases (`@/`, `@utils/`, …) defined in `tsconfig.json`.
- One Prisma model per service in `prisma/schema.prisma`.

## API Response Shape

All responses use a single envelope, implemented by `responseHandler` middleware:

- Success: `{ success: true, data: T }`
- Error:   `{ success: false, data: string }` (error message in `data`)

Never build response objects manually. Always use `res.success(data?)` and `res.error(message, statusCode?)`.

## Request Flow

```
Client → API Gateway / upstream → injects x-user-id, x-service-name, x-request-id headers → service
```

`post` and `profile` use `requestHeaderHandler` middleware to map these headers onto `req.userId`,
`req.serviceName`, and `req.requestId`. The `auth` service does **not** use `requestHeaderHandler` —
it is the upstream issuer, not a downstream consumer.

## Boundaries (Do NOT)

- Each service owns its own database — never query another service's DB directly.
- Never import code from another service's directory.
- Inter-service synchronous calls use direct HTTP. Async/fan-out messaging is planned via RabbitMQ (see Roadmap).
- Never add JWT validation inside `post` or `profile` — JWT verification is handled exclusively in `auth`.
- In `post` and `profile`: never read `x-user-id` from raw headers. Use `req.userId` (set by `requestHeaderHandler`).
- Each service is self-contained — there is no shared code module. If two services need the same type or util, duplicate it in each.

## Commits

```
[SERVICE] type: description

[AUTH] feat: add token rotation on refresh
[POST] fix: ownership check on delete
[PROFILE] feat: add avatar support
```

## Roadmap

- **RabbitMQ** — the broker and the `newsletter` consumer are in place; the `post` service does
  not yet publish `post.published`, so feeds stay empty until that is built.

## READ WHEN

- Working on a specific service → `services/<service>/CLAUDE.md`
- Setting up a new service → `services/agent_docs/new-service-creation.md`
